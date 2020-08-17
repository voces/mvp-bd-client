import { Component } from "../core/Component";
import { Entity } from "../core/Entity";

export class Position extends Component<
	[number, number, { zOffset: number; flyHeight: number }]
> {
	protected static map = new WeakMap<Entity, Position>();
	static get(entity: Entity): Position | undefined {
		return this.map.get(entity);
	}

	readonly x!: number;
	readonly y!: number;
	readonly zOffset!: number;
	readonly flyHeight!: number;

	constructor(
		entity: Entity,
		x: number,
		y: number,
		{
			zOffset = 0,
			flyHeight = 0,
		}: { zOffset?: number; flyHeight?: number } = {},
	) {
		super(entity, x, y, { zOffset, flyHeight });
	}

	protected initialize(
		x: number,
		y: number,
		{ zOffset, flyHeight }: { zOffset: number; flyHeight: number },
	): void {
		(this.x as number) = x;
		(this.y as number) = y;
		(this.zOffset as number) = zOffset;
		(this.flyHeight as number) = flyHeight;
	}
}
