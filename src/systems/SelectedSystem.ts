import { System } from "../core/System";
import { Sprite } from "../entities/sprites/Sprite";
import { Selected } from "../components/Selected";
import {
	MeshBuilderComponent,
	MeshBuilderComponentManager,
} from "../components/graphics/MeshBuilderComponent";

export class SelectedSystem extends System {
	static components = [Selected, MeshBuilderComponent];

	test(entity: Sprite): entity is Sprite {
		return Selected.has(entity) && MeshBuilderComponentManager.has(entity);
	}

	onAddEntity(entity: Sprite): void {
		const div = MeshBuilderComponentManager.get(entity)?.entityElement;
		if (!div) return;
		div.classList.add("selected");
	}

	onRemoveEntity(entity: Sprite): void {
		const div = MeshBuilderComponentManager.get(entity)?.entityElement;
		if (!div) return;
		div.classList.remove("selected");
	}
}
