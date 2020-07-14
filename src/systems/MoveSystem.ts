import { System } from "../core/System.js";
import { MoveTargetManager, MoveTarget } from "../components/MoveTarget.js";
import { Sprite } from "../sprites/Sprite.js";
import { calcAndTweenShortenedPath } from "../util/tweenPoints.js";
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

	private data = new WeakMap<Sprite, { ticks: number; progress: number }>();

	test(entity: Sprite): entity is Unit {
		return MoveTargetManager.has(entity) && entity instanceof Unit;
	}

	onAddEntity(entity: Unit): void {
		this.data.set(entity, { ticks: 0, progress: 0 });
	}

	update(entity: Unit, delta: number, time: number, retry = true): void {
		const moveTarget = MoveTargetManager.get(entity);
		const data = this.data.get(entity);

		if (!moveTarget || !data) this.remove(entity);
		else {
			const pathingMap = entity.round.pathingMap;

			// Move
			data.progress += delta * entity.speed;
			const { x, y } = moveTarget.path(data.progress);

			// Validate data
			if (isNaN(x) || isNaN(y)) {
				MoveTargetManager.delete(entity);
				throw new Error(`Returning NaN location x=${x} y=${y}`);
			}

			// Update self
			const pathable = pathingMap.pathable(entity, x, y);
			if (pathable) entity.position.setXY(x, y);

			// Recheck path, start a new one periodically or if check fails
			if (
				!pathable ||
				data.ticks % 5 === 0 ||
				!withoutTarget(pathingMap, moveTarget.target, () =>
					pathingMap.recheck(
						moveTarget.path.points,
						entity,
						delta * entity.speed * 6,
					),
				)
			) {
				moveTarget.path = calcAndTweenShortenedPath(
					entity,
					moveTarget.target,
					moveTarget.distance,
				);

				data.progress = 0;

				if (!pathable && retry) this.update(entity, delta, time, false);
			}
		}
	}
}
