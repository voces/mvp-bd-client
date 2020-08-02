import { document } from "../util/globals";
import { System } from "../core/System";
import { WORLD_TO_GRAPHICS_RATIO } from "../constants";
import { Sprite } from "../entities/sprites/Sprite";
import { MoveTargetManager } from "../components/MoveTarget";
import { Unit } from "../entities/sprites/Unit";
import { dragSelect } from "../entities/sprites/dragSelect";
import {
	MeshBuilderComponentManager,
	MeshBuilderComponent,
} from "../components/graphics/MeshBuilderComponent";

// TODO: abstract dom into a class
const arenaElement = document.getElementById("arena")!;

export type EntityElement = HTMLDivElement & { sprite: Sprite };

type EntityData = {
	onChangePositionListener: () => void;
	onHealthChangeListener: (prop: string) => void;
	updatePosition: boolean;
	updateHealth: boolean;
};

class HTMLGraphics extends System<Sprite> {
	private entityData: Map<Sprite, EntityData> = new Map();
	protected dirty = new Set<Sprite>();
	static components = [MeshBuilderComponent];

	test(entity: Sprite): entity is Sprite {
		return MeshBuilderComponentManager.has(entity);
	}

	onAddEntity(entity: Sprite): void {
		const oldData = this.entityData.get(entity);
		if (oldData) return;

		const MeshBuilderComponent = MeshBuilderComponentManager.get(entity);
		if (!MeshBuilderComponent) return this.remove(entity);

		// Create a div if no htmlElement (only do this once!)
		const div = Object.assign(document.createElement("div"), {
			sprite: entity,
		});

		div.classList.add(this.constructor.name.toLowerCase(), "sprite");

		// Position & sizing
		div.style.left =
			(entity.position.x - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";
		div.style.top =
			(entity.position.y - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";
		div.style.width = entity.radius * WORLD_TO_GRAPHICS_RATIO * 2 + "px";
		div.style.height = entity.radius * WORLD_TO_GRAPHICS_RATIO * 2 + "px";

		// Color
		const color =
			MeshBuilderComponent.color ??
			entity.color ??
			entity.owner?.color?.hex ??
			"white";

		if (entity.owner) div.setAttribute("owner", entity.owner.id.toString());
		div.style.backgroundColor = color;
		if (MeshBuilderComponent.texture)
			div.style.backgroundImage = MeshBuilderComponent.texture;

		// Shape
		if (MeshBuilderComponent.shape === "circle")
			div.style.borderRadius = "50%";

		// Transforms
		const transforms = [];
		if (MeshBuilderComponent.scale !== 1)
			transforms.push(`scale(${MeshBuilderComponent.scale})`);
		if (entity.facing !== 270)
			transforms.push(`rotate(${entity.facing - 270})`);
		if (transforms.length > 0) div.style.transform = transforms.join(" ");

		// Shadows
		if (MeshBuilderComponent.shadow)
			div.style.boxShadow = MeshBuilderComponent.shadow;

		arenaElement.appendChild(div);

		MeshBuilderComponent.entityElement = div;

		const data = {
			onChangePositionListener: () => {
				this.dirty.add(entity);
				data.updatePosition = true;
			},
			onHealthChangeListener: (prop: string) => {
				if (prop !== "health") return;
				this.dirty.add(entity);
				data.updateHealth = true;
			},
			updatePosition: true,
			updateHealth: true,
		};

		entity.position.addEventListener(
			"change",
			data.onChangePositionListener,
		);
		entity.addEventListener("change", data.onHealthChangeListener);
		this.entityData.set(entity, data);

		if (entity.selectable) dragSelect.addSelectables([entity]);
	}

	onRemoveEntity(entity: Sprite): void {
		const MeshBuilderComponent = MeshBuilderComponentManager.get(entity);
		if (MeshBuilderComponent) {
			const div = MeshBuilderComponent?.entityElement;
			if (div) arenaElement.removeChild(div);
			MeshBuilderComponent.entityElement = undefined;
		}

		const data = this.entityData.get(entity);
		if (data) {
			entity.position.removeEventListener(
				"change",
				data.onChangePositionListener,
			);
			entity.removeEventListener("change", data.onHealthChangeListener);
		}

		this.entityData.delete(entity);
	}

	private updatePosition(
		elem: EntityElement,
		entity: Sprite,
		delta: number,
		time: number,
		data: EntityData,
	): boolean {
		const moveTarget = MoveTargetManager.get(entity);
		if (moveTarget && Unit.isUnit(entity)) {
			moveTarget.renderProgress += entity.speed * delta;
			const { x, y } = moveTarget.path(moveTarget.renderProgress);
			elem.style.left =
				(x - entity.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			elem.style.top =
				(y - entity.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			return true;
		}

		// Otherwise update the rendering position and mark clean
		elem.style.left =
			(entity.position.x - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";
		elem.style.top =
			(entity.position.y - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";

		data.updatePosition = false;
		return false;
	}

	private updateHealth(
		elem: EntityElement,
		entity: Sprite,
		data: EntityData,
	): boolean {
		if (entity.health <= 0) elem.classList.add("death");
		else
			elem.style.opacity = Math.max(
				entity.health / entity.maxHealth,
				0.1,
			).toString();

		data.updateHealth = false;
		return false;
	}

	render(entity: Sprite, delta: number, time: number): void {
		const MeshBuilderComponent = MeshBuilderComponentManager.get(entity);
		const div = MeshBuilderComponent?.entityElement;
		const data = this.entityData.get(entity);
		if (!data || !div) return;

		const stillDirty = [
			data.updatePosition &&
				this.updatePosition(div, entity, delta, time, data),
			data.updateHealth && this.updateHealth(div, entity, data),
		].some((v) => v);

		if (!stillDirty) this.dirty.delete(entity);
	}
}

export { HTMLGraphics };
