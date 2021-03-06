import { Sprite } from "../Sprite";
import type { Obstruction } from "./units/Obstruction";

// TODO: this should have to extend Sprite (health/owner are silly)
export class Blueprint extends Sprite {
	static buildTime = 0;

	constructor({
		obstruction,
		...props
	}: {
		obstruction: typeof Obstruction;
		x: number;
		y: number;
	}) {
		const clonedDefaults = obstruction.clonedDefaults;
		super({
			...clonedDefaults,
			selectable: false,
			// This is just internal
			// eslint-disable-next-line no-restricted-syntax
			id: Math.random() * -1,
			color: "rgba( 70, 145, 246 )",
			meshBuilder: {
				...clonedDefaults.meshBuilder,
				colorFilter: undefined,
				opacity: 0.5,
			},
			...props,
		});
	}
}
