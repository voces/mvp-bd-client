import type { ObstructionProps } from "../../../engine/entities/widgets/sprites/units/Obstruction";
import { Obstruction } from "../../../engine/entities/widgets/sprites/units/Obstruction";

export class Tiny extends Obstruction {
	static defaults = {
		...Obstruction.defaults,
		collisionRadius: 0.5,
		maxHealth: 40,
		buildHotkey: "t" as const,
	};

	constructor(props: ObstructionProps) {
		super({ ...Tiny.clonedDefaults, ...props });
	}
}
