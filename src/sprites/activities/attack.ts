import { Unit } from "../Unit.js";
import { Sprite } from "../Sprite.js";
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
		distanceToTarget <=
		attacker.weapon.range + attacker.radius + target.radius
	);
};

class NoWeaponError extends Error {}
class TargetTooFarError extends Error {}

export const attack = (attacker: Unit, target: Sprite): void => {
	// We can't attack without a weapon
	if (!attacker.weapon) throw new NoWeaponError();

	// Attacker can't move and target is not in range; do nothing
	if (!attacker.speed && isInRange(attacker, target))
		throw new TargetTooFarError();

	AttackTargetManager.set(attacker, new AttackTarget(attacker, target));
	MoveTargetManager.set(
		attacker,
		new MoveTarget({
			entity: attacker,
			target,
			distance: attacker.radius + attacker.weapon.range + target.radius,
		}),
	);

	attacker.activity = {
		update: () => {
			if (!attacker.weapon) {
				attacker.activity = undefined;
				MoveTargetManager.delete(attacker);
				return;
			}

			if (target.health <= 0) {
				attacker.activity = undefined;
				MoveTargetManager.delete(attacker);
				return;
			}

			// Not within range and not in cooldown
			if (
				!isInRange(attacker, target) ||
				attacker.weapon.last + attacker.weapon.cooldown >
					attacker.round.lastUpdate
			)
				return;

			if (attacker.weapon.projectile === "instant") {
				const damage = attacker.isIllusion ? 0 : attacker.weapon.damage;
				const actualDamage = target.damage(damage);
				if (attacker.weapon.onDamage)
					attacker.weapon.onDamage(target, actualDamage, attacker);

				if (target.health <= 0) {
					attacker.activity = undefined;
					MoveTargetManager.delete(attacker);
				}
			} else attacker.weapon.projectile(target, attacker);

			if (attacker.html?.htmlElement)
				attacker.html.htmlElement.classList.add("attack");
			attacker.round.setTimeout(
				() => attacker.html?.htmlElement?.classList.remove("attack"),
				0.25,
			);
			attacker.weapon.last = attacker.round.lastUpdate;
		},
		toJSON: () => ({
			name: "attack",
			target: target.id,
		}),
	};
};
