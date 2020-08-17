import { Component } from "../core/Component";
import { Sprite } from "../entities/sprites/Sprite";

export class Selected extends Component {
	protected static map = new WeakMap<Sprite, Selected>();
	static get(entity: Sprite): Selected | undefined {
		return this.map.get(entity);
	}
}
