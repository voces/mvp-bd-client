import { Sprite } from "../entities/sprites/Sprite";
import { Component } from "../core/Component";
import { ComponentManager } from "../core/ComponentManager";

export class AttackTarget extends Component {
	target: Sprite;

	constructor(entity: Sprite, target: Sprite) {
		super(entity);
		this.target = target;
	}
}

export const AttackTargetManager = new ComponentManager<AttackTarget>(
	AttackTarget,
);
