import { Sprite } from "../entities/sprites/Sprite";
import { Component } from "../core/Component";
import { ComponentManager } from "../core/ComponentManager";

export class HoldPositionComponent extends Component {
	constructor(entity: Sprite) {
		super(entity);
	}
}

export const HoldPositionManager = new ComponentManager<HoldPositionComponent>(
	HoldPositionComponent,
);
