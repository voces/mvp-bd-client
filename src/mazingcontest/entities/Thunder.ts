import type { ObstructionProps } from "./Obstruction";
import { Obstruction } from "./Obstruction";

export class Thunder extends Obstruction {
	static defaults = {
		...Obstruction.defaults,
		buildHotkey: "n" as const,
		cost: { gold: 1, lumber: 1 },
	};

	constructor(props: ObstructionProps) {
		super({ ...Thunder.clonedDefaults, ...props });
	}
}
