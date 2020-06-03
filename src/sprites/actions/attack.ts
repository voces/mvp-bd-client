import { WORLD_TO_GRAPHICS_RATIO } from "../../constants.js";
import { tweenPoints, PathTweener } from "../../util/tweenPoints.js";
import { Unit } from "../Unit.js";
import { Sprite } from "../Sprite.js";
import { Point } from "../../pathing/PathingMap.js";

const isInRange = (attacker: Unit, target: Sprite) => {
	if (!attacker.weapon) return false;

	const distanceToTarget = Math.sqrt(
		(target.x - attacker.x) ** 2 + (target.y - attacker.y) ** 2,
	);
	return (
		distanceToTarget <
		attacker.weapon.range + attacker.radius + target.radius
	);
};

export default (attacker: Unit, target: Sprite): void => {
	if (!attacker.weapon) return;

	const pathingMap = attacker.round.pathingMap;
	let path: PathTweener;
	let renderProgress = 0;
	let renderedPosition: Point;

	const recalcPath = ({ x, y }: Point) => {
		// Update self
		attacker.setPosition(x, y);

		// Start new attack path
		path = tweenPoints(
			pathingMap.withoutEntity(target, () =>
				pathingMap.path(attacker, target),
			),
		);
		renderProgress = 0;
	};

	// Attacker can't move and target is not in range; do nothing
	if (!attacker.speed && !isInRange(attacker, target)) return;

	attacker.action = {
		toJSON: () => ({
			target: target.id,
		}),
	};

	if (attacker.speed) {
		path = tweenPoints(
			pathingMap.withoutEntity(target, () =>
				pathingMap.path(attacker, target),
			),
		);

		// We only render the attacker moving
		attacker.action.render = (delta) => {
			if (!attacker.weapon) return;

			const range =
				attacker.weapon.range + attacker.radius + target.radius;
			const realDistanceToTarget = Math.sqrt(
				(target.x - attacker.x) ** 2 + (target.y - attacker.y) ** 2,
			);
			// If we're attacking, we don't need to animate movement
			if (realDistanceToTarget < range) return;

			// If we're rendered as near enough, no need to animate movement
			const pos = renderedPosition || attacker;
			const renderedDistanceToTarget = Math.sqrt(
				(target.x - pos.x) ** 2 + (target.y - pos.y) ** 2,
			);
			if (renderedDistanceToTarget < range) return;

			renderProgress += delta * attacker.speed;
			let { x, y } = path(renderProgress);

			const distanceToTarget = Math.sqrt(
				(target.x - x) ** 2 + (target.y - y) ** 2,
			);
			if (distanceToTarget < range) {
				const newPoint = path.radialStepBack(range);
				x = newPoint.x;
				y = newPoint.y;
			}

			renderedPosition = { x, y };
			attacker.elem.style.left =
				(x - attacker.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			attacker.elem.style.top =
				(y - attacker.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
		};
	}

	attacker.action.update = (delta) => {
		if (!attacker.weapon) {
			attacker.action = undefined;
			return;
		}

		let x = attacker.x;
		let y = attacker.y;
		const updateProgress = delta * (attacker.speed || 0);

		if (attacker.speed) {
			const newPoint = path(updateProgress);
			x = newPoint.x;
			y = newPoint.y;
		}

		if (target.health <= 0) {
			// Target dead, update position and complete
			if (attacker.speed) attacker.setPosition(x, y);
			attacker.action = undefined;
			return;
		}

		// Within range to attack
		if (isInRange(attacker, target)) {
			// Not on cooldown
			if (
				!attacker.weapon.last ||
				attacker.weapon.last + attacker.weapon.cooldown <
					attacker.round.lastUpdate
			) {
				if (attacker.weapon.projectile === "instant") {
					const damage = attacker.isMirror
						? 0
						: attacker.weapon.damage;
					const actualDamage = target.damage(damage);
					if (attacker.weapon.onDamage)
						attacker.weapon.onDamage(
							target,
							actualDamage,
							attacker,
						);

					if (target.health <= 0) {
						if (attacker.speed) attacker.setPosition(x, y);
						attacker.action = undefined;
					}
				} else attacker.weapon.projectile(target, attacker);

				attacker.elem.classList.add("attack");
				attacker.round.setTimeout(
					() =>
						attacker.elem &&
						attacker.elem.classList.remove("attack"),
					0.25,
				);
				attacker.weapon.last = attacker.round.lastUpdate;
			}
		} else if (path && path.distance === 0) {
			attacker.action = undefined;
			attacker.setPosition(x, y);
		} else if (attacker.speed) recalcPath({ x, y });
	};
};
