import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { SceneObjectComponent } from "../components/graphics/SceneObjectComponent";
import { Hover } from "../components/Hover";
import { Position } from "../components/Position";
import { Selected } from "../components/Selected";
import { currentGame } from "../gameContext";

/**
 * For rendered objects, if the position is explicitly set, we should also
 * update the rendered position.
 */
export class GraphicTrackPosition extends System {
	static components = [SceneObjectComponent, Position];

	test(entity: Entity): entity is Entity {
		return SceneObjectComponent.has(entity) && Position.has(entity);
	}

	private updatePosition(entity: Entity) {
		const position = entity.get(Position)[0]!;
		const object = entity.get(SceneObjectComponent)[0]!.object;
		const game = currentGame();

		object.position.x = position.x;
		object.position.y = position.y;
		object.position.z = game.terrain!.groundHeight(position.x, position.y);

		// TODO: we can probably generalize this with a Children component
		[Selected, Hover].forEach((Circle) => {
			const circle = entity.get(Circle)[0]?.circle;
			if (circle) circle.get(Position)[0]!.setXY(position.x, position.y);
		});
	}

	onAddEntity(entity: Entity): void {
		this.updatePosition(entity);
	}

	modified(entity: Entity): void {
		this.updatePosition(entity);
	}
}
