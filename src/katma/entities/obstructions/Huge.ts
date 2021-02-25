import type { ObstructionProps } from "../../../engine/entities/widgets/sprites/units/Obstruction";
import { Obstruction } from "../../../engine/entities/widgets/sprites/units/Obstruction";

export class Huge extends Obstruction {
	static defaults = {
		...Obstruction.defaults,
		collisionRadius: 2,
		maxHealth: 200,
		buildTime: 3,
		cost: { essence: 10 },
		buildHotkey: "r" as const,
	};

	constructor(props: ObstructionProps) {
		super({ ...Huge.clonedDefaults, ...props });
	}
}
