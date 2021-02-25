import type { ObstructionProps } from "../../../engine/entities/widgets/sprites/units/Obstruction";
import { Obstruction } from "../../../engine/entities/widgets/sprites/units/Obstruction";

export class Basic extends Obstruction {
	static defaults = {
		...Obstruction.defaults,
		maxHealth: 120,
		buildHotkey: "f" as const,
	};

	constructor(props: ObstructionProps) {
		super({ ...Basic.clonedDefaults, ...props });
	}
}
