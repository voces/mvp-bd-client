import { Sprite, SpriteProps } from "../Sprite";

export class Blueprint extends Sprite {
	static buildTime = 0;

	static defaults = {
		...Sprite.defaults,
		selectable: false,
		id: -1,
		color: "rgba( 70, 145, 246 )",
		graphic: {
			...Sprite.defaults.graphic,
			shape: "square" as "square" | "circle",
			opacity: 0.5,
		},
	};

	constructor(props: SpriteProps) {
		super({ ...Blueprint.clonedDefaults, ...props });
	}
}
