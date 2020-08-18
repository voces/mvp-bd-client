import { System } from "../core/System";
import { Selected } from "../components/Selected";
import { Entity } from "../core/Entity";
// import { Game } from "../Game";

export class SelectedSystem extends System {
	static components = [Selected];

	static isSelectedSystem = (system: System): system is SelectedSystem =>
		system instanceof SelectedSystem;

	test(entity: Entity): entity is Entity {
		return Selected.has(entity);
	}

	onAddEntity(): void {
		// Game.context.disp
	}

	get selection(): ReadonlyArray<Entity> {
		return Array.from(this);
	}

	select(entity: Entity): boolean {
		if (this.test(entity)) return false;
		new Selected(entity);
		return true;
	}

	setSelection(entities: ReadonlyArray<Entity>): void {
		for (const curSelected of this) Selected.clear(curSelected);
		for (const newSelected of entities) new Selected(newSelected);
	}
}
