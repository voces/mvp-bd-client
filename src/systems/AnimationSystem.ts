import { System } from "../core/System";
import { Sprite } from "../entities/sprites/Sprite";
import {
	Animation,
	AnimationManager,
} from "../components/graphics/Animation";
import { MeshBuilderComponentManager } from "../components/graphics/MeshBuilderComponent";

export class AnimationSystem extends System<Sprite> {
	static components = [Animation];
	private entityData = new Map<Sprite, { animation: Animation }>();

	test(entity: Sprite): entity is Sprite {
		return (
			AnimationManager.has(entity) &&
			MeshBuilderComponentManager.has(entity)
		);
	}

	onAddEntity(entity: Sprite): void {
		const div = MeshBuilderComponentManager.get(entity)?.entityElement;
		if (!div) return this.remove(entity);

		const animation = AnimationManager.get(entity);
		if (!animation) return this.remove(entity);

		div.classList.add(animation.animation);

		this.entityData.set(entity, { animation });
	}

	onRemoveEntity(entity: Sprite): void {
		const data = this.entityData.get(entity);
		if (!data) return;

		const div = MeshBuilderComponentManager.get(entity)?.entityElement;
		if (!div) return this.remove(entity);

		div.classList.remove(data.animation.animation);
	}
}
