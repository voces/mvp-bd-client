import { System } from "../core/System.js";
import { MoveTargetManager, MoveTarget } from "../components/MoveTarget.js";
import { Sprite } from "../sprites/Sprite.js";
import { Unit } from "../sprites/Unit.js";
import { PathingMap, Point } from "../pathing/PathingMap.js";

const withoutTarget = <A>(
	pathingMap: PathingMap,
	target: Point | Sprite,
	fn: () => A,
): A => {
	if (Sprite.isSprite(target)) return pathingMap.withoutEntity(target, fn);

	return fn();
};

export class MoveSystem extends System<Unit> {
	static components = [MoveTarget];

	test(entity: Sprite): entity is Unit {
		return MoveTargetManager.has(entity) && entity instanceof Unit;
	}

	update(entity: Unit, delta: number, time: number, retry = true): void {
		const moveTarget = MoveTargetManager.get(entity);

		if (!moveTarget) return this.remove(entity);

		const pathingMap = entity.round.pathingMap;

		// Move
		moveTarget.progress += delta * entity.speed;
		const { x, y } = moveTarget.path(moveTarget.progress);

		// Validate data
		if (isNaN(x) || isNaN(y)) {
			MoveTargetManager.delete(entity);
			throw new Error(`Returning NaN location x=${x} y=${y}`);
		}

		// Update self
		const pathable = pathingMap.pathable(entity, x, y);
		if (pathable) entity.position.setXY(x, y);

		if (moveTarget.path.distance === 0) {
			entity.activity = undefined;
			MoveTargetManager.delete(entity);
		}

		// Recheck path, start a new one periodically or if check fails
		if (
			!pathable ||
			moveTarget.ticks % 5 === 0 ||
			!withoutTarget(pathingMap, moveTarget.target, () =>
				pathingMap.recheck(
					moveTarget.path.points,
					entity,
					delta * entity.speed * 6,
				),
			)
		) {
			moveTarget.recalc();

			if (!pathable && retry) this.update(entity, delta, time, false);
		}
	}
}
