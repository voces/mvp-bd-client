import { System } from "../core/System";
import { Selected } from "../components/Selected";
import { Entity } from "../core/Entity";
import { Position, getEntityXY } from "../components/Position";
import { MoveTargetManager, MoveTarget } from "../components/MoveTarget";

export class MovingSelectionCircles extends System {
	static components = [Selected, MoveTarget];

	test(entity: Entity): entity is Entity {
		return (
			Selected.has(entity) &&
			// Movement is legacy
			MoveTargetManager.has(entity)
		);
	}

	update(entity: Entity): void {
		const circle = Selected.get(entity)?.circle;
		if (!circle) return;

		const xy = getEntityXY(entity);

		Position.clear(circle);
		new Position(circle, xy ? xy.x : 0, xy ? xy.y : 0);
	}
}
