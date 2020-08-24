import { isEqual } from "lodash-es";
import { System } from "../core/System";
import { Selected } from "../components/Selected";
import { Entity } from "../core/Entity";
import { Game } from "../Game";
import { MouseButton } from "./Mouse";

export class SelectedSystem extends System {
	static components = [Selected];

	static isSelectedSystem = (system: System): system is SelectedSystem =>
		system instanceof SelectedSystem;

	data = new WeakMap<Entity, Selected>();

	constructor() {
		super();

		Game.manager.context?.mouse.addEventListener(
			"mouseDown",
			({ button, mouse: { entity } }) => {
				if (button === MouseButton.LEFT && entity)
					this.setSelection([entity]);
			},
		);
	}

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
		const curIds: unknown[] = [];
		for (const curSelected of this) curIds.push(curSelected.id);
		const newIds = entities.map((e) => e.id);

		if (isEqual(curIds.sort(), newIds.sort())) return;

		for (const curSelected of this) Selected.clear(curSelected);
		for (const newSelected of entities) new Selected(newSelected);
	}
}
