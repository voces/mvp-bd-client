import { System } from "../core/System";
import { Selected } from "../components/Selected";
import { Entity } from "../core/Entity";
import { App } from "../core/App";
import { Game } from "../Game";

export class SelectedSystem extends System {
	static components = [Selected];

	static isSelectedSystem = (system: System): system is SelectedSystem =>
		system instanceof SelectedSystem;

	data = new WeakMap<Entity, Selected>();

	test(entity: Entity): entity is Entity {
		return Selected.has(entity);
	}

	onAddEntity(entity: Entity): void {
		const selected = Selected.get(entity);
		if (!selected) throw new Error("expected Selected component");
		this.data.set(entity, selected);
		Game.manager.context?.dispatchEvent("selection", Array.from(this));
	}

	onRemoveEntity(entity: Entity): void {
		const selected = this.data.get(entity);
		if (!selected) return;
		App.manager.context?.remove(selected.circle);
		Game.manager.context?.dispatchEvent("selection", Array.from(this));
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
