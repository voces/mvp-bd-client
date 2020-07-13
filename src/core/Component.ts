import { Sprite } from "../sprites/Sprite";

export class Component<T extends Sprite = Sprite> {
	readonly entity: T;

	constructor(entity: T) {
		this.entity = entity;
	}
}
