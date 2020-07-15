import { document } from "../util/globals.js";
import { System } from "../core/System.js";
import { WORLD_TO_GRAPHICS_RATIO } from "../constants.js";
import { Sprite } from "../sprites/Sprite.js";
import { MoveTargetManager } from "../components/MoveTarget.js";
import { Unit } from "../sprites/Unit.js";

// TODO: abstract dom into a class
const arenaElement = document.getElementById("arena")!;

export type HTMLComponent = {
	htmlElement?: EntityElement;
} & (
	| {
			generator: () => EntityElement;
	  }
	| {
			shape: "square" | "circle";
	  }
);

type HTMLEntity = Sprite & {
	html: HTMLComponent;
};

export type EntityElement = HTMLDivElement & { sprite: HTMLEntity };

class HTMLGraphics extends System<HTMLEntity> {
	entityData: Map<HTMLEntity, { onRemoveListener: () => void }> = new Map();
	protected dirty = new Set<HTMLEntity>();

	test(entity: Sprite): entity is HTMLEntity {
		return !!entity.html;
	}

	onAddEntity(entity: HTMLEntity): void {
		// Create a div if no htmlElement (only do this once!)
		if (!entity.html.htmlElement) {
			const div = Object.assign(document.createElement("div"), {
				sprite: entity,
			});
			entity.html.htmlElement = div;
		}

		// We should have one, now!
		const elem = entity.html.htmlElement!;

		elem.classList.add(this.constructor.name.toLowerCase(), "sprite");
		elem.style.left =
			(entity.position.x - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";
		elem.style.top =
			(entity.position.y - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";
		elem.style.width = entity.radius * WORLD_TO_GRAPHICS_RATIO * 2 + "px";
		elem.style.height = entity.radius * WORLD_TO_GRAPHICS_RATIO * 2 + "px";

		if (entity.owner) {
			if (!entity.color && entity.owner.color)
				elem.style.backgroundColor = entity.owner.color.hex;
			elem.setAttribute("owner", entity.owner.id.toString());
		} else elem.style.backgroundColor = entity.color ?? "white";

		arenaElement.appendChild(elem);

		const onRemoveListener = () => this.dirty.add(entity);
		entity.position.addEventListener("change", onRemoveListener);
		this.entityData.set(entity, { onRemoveListener });
	}

	onRemoveEntity(entity: HTMLEntity): void {
		if (!entity.html.htmlElement) return;

		arenaElement.removeChild(entity.html.htmlElement);
		const data = this.entityData.get(entity);
		if (data) {
			entity.position.removeEventListener(
				"change",
				data.onRemoveListener,
			);
			this.entityData.delete(entity);
		}
	}

	render(entity: HTMLEntity, delta: number, time: number): void {
		const elem = entity.html.htmlElement;
		if (!elem) return;

		const moveTarget = MoveTargetManager.get(entity);

		if (moveTarget && Unit.isUnit(entity)) {
			moveTarget.renderProgress += entity.speed * delta;
			const { x, y } = moveTarget.path(moveTarget.renderProgress);
			elem.style.left =
				(x - entity.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			elem.style.top =
				(y - entity.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			return;
		}

		// If we have a tween, we should use that and continue to consider
		// the entity dirty
		if (entity.position.renderTween) {
			const { x, y } = entity.position.renderTween(time);
			elem.style.left =
				(x - entity.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			elem.style.top =
				(y - entity.radius) * WORLD_TO_GRAPHICS_RATIO + "px";
			return;
		}

		// Otherwise update the rendering position and mark clean
		elem.style.left =
			(entity.position.x - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";
		elem.style.top =
			(entity.position.y - entity.radius) * WORLD_TO_GRAPHICS_RATIO +
			"px";

		this.dirty.delete(entity);
	}
}

export { HTMLGraphics };
