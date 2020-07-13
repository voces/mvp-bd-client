import { Point } from "../pathing/PathingMap";
import { Sprite } from "../sprites/Sprite";
import { Component } from "../core/Component";
import { ComponentManager } from "../core/ComponentManager";

export class AttackTarget extends Component {
	target: Point | Sprite;

	constructor(entity: Sprite, target: Point | Sprite) {
		super(entity);
		this.target = target;
	}
}

export const AttackTargetManager = new ComponentManager<AttackTarget>();
