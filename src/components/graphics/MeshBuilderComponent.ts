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

	constructor(
		entity: Entity,
		{
			shape,
			targetable,
			color,
			texture,
			scale = 1,
			shadow,
		}: {
			shape: "square" | "circle";
			targetable: boolean;
			color?: string;
			texture?: string;
			scale?: number;
			shadow?: string;
		},
	) {
		super(entity);
		this.shape = shape;
		this.targetable = targetable;
		this.color = color;
		this.texture = texture;
		this.scale = scale;
		this.shadow = shadow;
	}
}

export const MeshBuilderComponentManager = new DeprecatedComponentManager<
	MeshBuilderComponent
>(MeshBuilderComponent);
