import { System } from "../../core/System";
import { isInAttackRange } from "../api/UnitApi";
import { AttackTarget } from "../components/AttackTarget";
import { DamageComponent } from "../components/DamageComponent";
import { GerminateComponent } from "../components/GerminateComponent";
import { HoldPositionComponent } from "../components/HoldPositionComponent";
import { MoveTarget } from "../components/MoveTarget";
import { Sprite } from "../entities/widgets/Sprite";
import { Unit } from "../entities/widgets/sprites/Unit";
import { currentGame } from "../gameContext";

export class AutoAttackSystem extends System<Unit> {
	static components = [
		MoveTarget,
		AttackTarget,
		HoldPositionComponent,
		GerminateComponent,
		DamageComponent,
	];

	test(entity: Sprite): entity is Unit {
		const damageComponent = entity.get(DamageComponent)[0];
		return (
			!!damageComponent &&
			damageComponent.autoAttack &&
			Unit.isUnit(entity) &&
			entity.idle
		);
	}

	update(entity: Unit): void {
		if (!entity.idle) return this.remove(entity);

		const {
			position: { x, y },
		} = entity;

		const damageComponent = entity.get(DamageComponent)[0];

		if (!damageComponent) return this.remove(entity);
		const weapon = damageComponent.weapons[0];

		const pool = entity.owner
			.getEnemySprites()
			.filter(
				(s) =>
					Number.isFinite(s.health) &&
					(entity.speed > 0 || isInAttackRange(entity, s)),
			)
			.sort((a, b) => {
				// Prefer priority
				if (a.priority !== b.priority) return b.priority - a.priority;

				return (
					(a.position.x - x) ** 2 +
					(a.position.y - y) ** 2 -
					((b.position.x - x) ** 2 + (b.position.y - y) ** 2)
				);
			});

		const pathingMap = currentGame().pathingMap;
		const nearest =
			pool.find((u) => {
				// If unit in range, that's it
				const distanceToTarget = Math.sqrt(
					(u.position.x - entity.position.x) ** 2 +
						(u.position.y - entity.position.y) ** 2,
				);
				if (
					distanceToTarget <
					weapon.range + entity.collisionRadius + u.collisionRadius
				)
					return true;

				// Otherwise, make sure we can get to it
				if (entity.speed) {
					const endPoint = pathingMap
						.withoutEntity(u, () =>
							pathingMap.path(entity, u.position),
						)
						.pop();
					if (!endPoint) return false;

					const distance = Math.sqrt(
						(endPoint.x - u.position.x) ** 2 +
							(endPoint.y - u.position.y) ** 2,
					);

					if (
						distance <
						weapon.range +
							entity.collisionRadius +
							u.collisionRadius
					)
						return true;
				}

				return false;
			}) || pool[0];

		if (nearest) entity.attack(nearest);
	}
}
