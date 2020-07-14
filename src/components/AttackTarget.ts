import { Point } from "../pathing/PathingMap.js";
import { Sprite } from "../sprites/Sprite.js";
import { Component } from "../core/Component.js";
import { ComponentManager } from "../core/ComponentManager.js";

export class AttackTarget extends Component {
	target: Point | Sprite;

	constructor(entity: Sprite, target: Point | Sprite) {
		super(entity);
		this.target = target;
	}
}

export const AttackTargetManager = new ComponentManager<AttackTarget>(
	AttackTarget,
);
