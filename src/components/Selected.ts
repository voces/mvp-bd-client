import { Component } from "../core/Component";
import { Sprite } from "../entities/sprites/Sprite";
import { SelectionCircle } from "../entities/SelectionCircle";
import { Position } from "../components/Position";
import { Entity } from "../core/Entity";

type Props = {
	radius: number;
	color: string;
};

type InternalProps = Props & { x: number; y: number };

export class Selected extends Component<[InternalProps]> {
	protected static map = new WeakMap<Sprite, Selected>();
	static get(entity: Sprite): Selected | undefined {
		return this.map.get(entity);
	}

	circle!: SelectionCircle;

	constructor(entity: Entity, props: Partial<Props> = {}) {
		const position = Position.get(entity);
		super(entity, {
			radius:
				props.radius ?? (Sprite.isSprite(entity) ? entity.radius : 1),
			color: "#00FF00",
			x: position?.x ?? (Sprite.isSprite(entity) ? entity.position.x : 0),
			y: position?.y ?? (Sprite.isSprite(entity) ? entity.position.y : 0),
		});
		console.log(this);
	}

	initialize({ radius, color, x, y }: InternalProps): void {
		this.circle = new SelectionCircle({
			radius,
			color,
			x,
			y,
		});
	}
}
