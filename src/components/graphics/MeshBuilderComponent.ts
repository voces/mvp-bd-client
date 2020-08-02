import { Sprite } from "../../entities/sprites/Sprite";
import { Component } from "../../core/Component";
import { ComponentManager } from "../../core/ComponentManager";
import { EntityElement } from "../../systems/HTMLGraphics";

export class MeshBuilderComponent extends Component {
	readonly shape: "square" | "circle";
	readonly targetable: boolean;
	readonly color?: string;
	readonly texture?: string;
	readonly scale?: number;
	readonly shadow?: string;
	entityElement?: EntityElement;

	constructor(
		entity: Sprite,
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

export const MeshBuilderComponentManager = new ComponentManager<
	MeshBuilderComponent
>(MeshBuilderComponent);
