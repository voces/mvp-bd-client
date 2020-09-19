import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { ThreeObjectComponent } from "../components/graphics/ThreeObjectComponent";
import { Hover } from "../components/Hover";
import { MoveTarget } from "../components/MoveTarget";
import { Position } from "../components/Position";
import { Selected } from "../components/Selected";
import { currentGame } from "../gameContext";

type EntityWithSpeed = Entity & { speed: number };

const hasSpeed = (
	entity: Entity | EntityWithSpeed,
): entity is EntityWithSpeed =>
	"speed" in entity && typeof entity.speed === "number";

/**
 * For rendered moving objects, will tween the Three Object and their circles.
 */
export class GraphicMoveSystem extends System {
	static components = [ThreeObjectComponent, Position, MoveTarget];

	test(entity: Entity): entity is Entity {
		return (
			ThreeObjectComponent.has(entity) &&
			Position.has(entity) &&
			MoveTarget.has(entity)
		);
	}

	render(entity: Entity, delta: number): void {
		const object = entity.get(ThreeObjectComponent)[0]!.object;
		const moveTarget = entity.get(MoveTarget)[0];
		const game = currentGame();

		if (moveTarget && hasSpeed(entity)) {
			moveTarget.renderProgress += entity.speed * delta;
			const { x, y } = moveTarget.path(moveTarget.renderProgress);
			object.position.x = x;
			object.position.y = y;
			object.position.z =
				object.position.z * 0.8 +
				game.terrain!.groundHeight(x, y) * 0.2;
		} else {
			const position = entity.get(Position)[0]!;
			object.position.x = position.x;
			object.position.y = position.y;
			object.position.z = game.terrain!.groundHeight(
				position.x,
				position.y,
			);
		}

		// TODO: we can probably generalize this with a Children component
		[Selected, Hover].forEach((Circle) => {
			const circle = entity.get(Circle)[0]?.circle;
			if (circle) {
				const circleObject = circle.get(ThreeObjectComponent)[0]
					?.object;
				if (circleObject) circleObject.position.copy(object.position);
			}
		});
	}
}
