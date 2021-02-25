import type { UnitProps } from "../../engine/entities/widgets/sprites/Unit";
import { Unit } from "../../engine/entities/widgets/sprites/Unit";
import { Block } from "./Block";
import { Thunder } from "./Thunder";

export class Builder extends Unit {
	static defaults = {
		...Unit.defaults,
		builds: [Block, Thunder],
	};

	constructor(props: UnitProps) {
		super({ ...Builder.clonedDefaults, ...props });
	}
}
