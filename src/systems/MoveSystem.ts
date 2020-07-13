import { System } from "../core/System.js";
import { MoveTargetManager, MoveTarget } from "../components/MoveTarget.js";
import { Sprite } from "../sprites/Sprite.js";
import { calcAndTweenShortenedPath } from "../util/tweenPoints.js";
import { Unit } from "../sprites/Unit.js";

export class MoveSystem extends System<Unit> {
	private data = new WeakMap<
		Sprite,
		{ ticksSinceUpdate: number; progress: number }
	>();

	test(entity: Sprite): entity is Unit {
		return MoveTargetManager.has(entity) && entity instanceof Unit;
	}

	onAddEntity(entity: Unit): void {
		this.data.set(entity, { ticksSinceUpdate: 0, progress: 0 });
	}

	update(entity: Unit, delta: number): void {
		const moveTarget = MoveTargetManager.get(entity);
		const data = this.data.get(entity);

		if (!moveTarget || !data) this.remove(entity);
		else {
			if (data.ticksSinceUpdate > 4) {
				moveTarget.path = calcAndTweenShortenedPath(
					entity,
					moveTarget?.target,
					moveTarget?.distance,
				);
				data.ticksSinceUpdate = 0;
				data.progress = 0;
			}

			data.progress += delta * entity.speed;

			const { x, y } = path(data.progress);
			if (isNaN(x) || isNaN(y)) {
				MoveTargetManager.this.activity = undefined;
				throw new Error(`Returning NaN location x=${x} y=${y}`);
			}
		}
	}
}
