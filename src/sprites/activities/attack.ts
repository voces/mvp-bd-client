import { tweenPoints, PathTweener } from "../../util/tweenPoints.js";
import { Unit } from "../Unit.js";
import { Sprite } from "../Sprite.js";
import { Point } from "../../pathing/PathingMap.js";
import {
	AttackTargetManager,
	AttackTarget,
} from "../../components/AttackTarget.js";
import { MoveTargetManager, MoveTarget } from "../../components/MoveTarget.js";

const isInRange = (attacker: Unit, target: Sprite) => {
	if (!attacker.weapon) return false;

	const distanceToTarget = Math.sqrt(
		(target.position.x - attacker.position.x) ** 2 +
			(target.position.y - attacker.position.y) ** 2,
	);
	return (
		distanceToTarget <
		attacker.weapon.range + attacker.radius + target.radius
	);
};

class NoWeaponError extends Error {}
class TargetTooFarError extends Error {}

export const attack = (attacker: Unit, target: Sprite): void => {
	// We can't attack without a weapon
	if (!attacker.weapon) throw new NoWeaponError();

	const pathingMap = attacker.round.pathingMap;
	let path: PathTweener;
	let updateProgress = 0;
	let updateTicks = 0;
	let renderedPosition: Point | undefined;
	let start = 0;

	// Attacker can't move and target is not in range; do nothing
	if (!attacker.speed && isInRange(attacker, target))
		throw new TargetTooFarError();

	AttackTargetManager.set(attacker, new AttackTarget(attacker, target));
	MoveTargetManager.set(
		attacker,
		new MoveTarget({
			entity: attacker,
			target,
			distance: attacker.weapon.range,
		}),
	);

	attacker.activity = {
		toJSON: () => ({
			name: "attack",
			target: target.id,
			ticks: updateTicks,
		}),
	};

	if (attacker.speed) {
		path = tweenPoints(
			pathingMap.withoutEntity(target, () =>
				pathingMap.path(attacker, target.position),
			),
		);

		start = attacker.game.time;
		attacker.position.renderTween = (time: number) => {
			if (!attacker.weapon) return attacker.position;

			const range =
				attacker.weapon.range + attacker.radius + target.radius;
			const realDistanceToTarget = Math.sqrt(
				(target.position.x - attacker.position.x) ** 2 +
					(target.position.y - attacker.position.y) ** 2,
			);
			// If we're attacking, we don't need to animate movement
			if (realDistanceToTarget < range) return attacker.position;

			// If we're rendered as near enough, no need to animate movement
			const pos = renderedPosition || attacker.position;
			const renderedDistanceToTarget = Math.sqrt(
				(target.position.x - pos.x) ** 2 +
					(target.position.y - pos.y) ** 2,
			);
			if (renderedDistanceToTarget < range) return attacker.position;

			let { x, y } = path((time - start) * attacker.speed);

			const distanceToTarget = Math.sqrt(
				(target.position.x - x) ** 2 + (target.position.y - y) ** 2,
			);
			if (distanceToTarget < range) {
				const newPoint = path.radialStepBack(range);
				x = newPoint.x;
				y = newPoint.y;
			}

			renderedPosition = { x, y };

			return renderedPosition;
		};
	}

	const update = (delta: number) => {
		if (!attacker.weapon) {
			attacker.activity = undefined;
			return;
		}

		if (target.health <= 0) {
			attacker.activity = undefined;
			return;
		}

		updateTicks++;

		let { x, y } = attacker.position;
		const stepProgress = delta * attacker.speed;
		updateProgress += stepProgress;

		if (attacker.speed) {
			const newPoint = path(updateProgress);
			x = newPoint.x;
			y = newPoint.y;
		}

		// Within range to attack
		if (isInRange(attacker, target)) {
			// Not on cooldown
			if (
				attacker.weapon.last + attacker.weapon.cooldown <
				attacker.round.lastUpdate
			) {
				if (attacker.weapon.projectile === "instant") {
					const damage = attacker.isIllusion
						? 0
						: attacker.weapon.damage;
					const actualDamage = target.damage(damage);
					if (attacker.weapon.onDamage)
						attacker.weapon.onDamage(
							target,
							actualDamage,
							attacker,
						);

					if (target.health <= 0) attacker.activity = undefined;
				} else attacker.weapon.projectile(target, attacker);

				if (attacker.html?.htmlElement)
					attacker.html.htmlElement.classList.add("attack");
				attacker.round.setTimeout(
					() =>
						attacker.html?.htmlElement?.classList.remove("attack"),
					0.25,
				);
				attacker.weapon.last = attacker.round.lastUpdate;
			}
		} else if (path && path.distance === 0) {
			attacker.activity = undefined;
			attacker.position.setXY(x, y);

			renderedPosition = undefined;
		}
	};

	attacker.activity.update = update;
};
