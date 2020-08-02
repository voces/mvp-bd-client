import { Sprite } from "../entities/sprites/Sprite";
import { Component } from "../core/Component";
import { ComponentManager } from "../core/ComponentManager";
import { INITIAL_OBSTRUCTION_PROGRESS } from "../constants";

export class GerminateComponent extends Component {
	progress = INITIAL_OBSTRUCTION_PROGRESS;

	constructor(entity: Sprite) {
		super(entity);
	}
}

export const GerminateComponentManager = new ComponentManager<
	GerminateComponent
>(GerminateComponent);
