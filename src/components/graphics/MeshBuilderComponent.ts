import { DeprecatedComponent } from "../../core/Component";
import { DeprecatedComponentManager } from "../../core/DeprecatedComponentManager";
import { Entity } from "../../core/Entity";

export class MeshBuilderComponent extends DeprecatedComponent {
	readonly shape: "square" | "circle";
	readonly targetable: boolean;
	readonly color?: string;
	readonly texture?: string;
	readonly scale?: number;
	readonly shadow?: string;
	readonly opacity: number;

	constructor(
		entity: Entity,
		{
			shape,
			targetable,
			color,
			texture,
			scale = 1,
			shadow,
			opacity = 1,
		}: {
			shape: "square" | "circle";
			targetable: boolean;
			color?: string;
			texture?: string;
			scale?: number;
			shadow?: string;
			opacity?: number;
		},
	) {
		super(entity);
		this.shape = shape;
		this.targetable = targetable;
		this.color = color;
		this.texture = texture;
		this.scale = scale;
		this.shadow = shadow;
		this.opacity = opacity;
	}
}

export const MeshBuilderComponentManager = new DeprecatedComponentManager<
	MeshBuilderComponent
>(MeshBuilderComponent);
