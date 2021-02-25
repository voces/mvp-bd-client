import type { ObstructionProps } from "../../engine/entities/widgets/sprites/units/Obstruction";
import { Obstruction } from "../../engine/entities/widgets/sprites/units/Obstruction";

export class Block extends Obstruction {
	static defaults = {
		...Obstruction.defaults,
		buildHotkey: "b" as const,
		cost: { lumber: 1 },
	};

	constructor(props: ObstructionProps) {
		super({ ...Block.clonedDefaults, ...props });
	}
}
