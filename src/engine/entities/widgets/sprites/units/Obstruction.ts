import type { Action } from "../../../../actions/types";
import { toFootprint } from "../../../../api/toFootprint";
import { GerminateComponent } from "../../../../components/GerminateComponent";
import {
	INITIAL_OBSTRUCTION_PROGRESS,
	PATHING_TYPES,
} from "../../../../constants";
import type { Player } from "../../../../players/Player";
import type { UnitProps } from "../Unit";
import { Unit } from "../Unit";

export type ObstructionProps<Resource extends string> = UnitProps & {
	buildTime?: number;
	cost?: Record<Resource, number>;
	owner: Player;
};

export class Obstruction<Resource extends string = string> extends Unit {
	static readonly isObstruction = true;

	static defaults = {
		...Unit.defaults,
		buildHotkey: undefined as Action["hotkey"] | undefined,
		buildDescription: undefined as string | undefined,
		cost: {},
		requiresPathing: PATHING_TYPES.WALKABLE | PATHING_TYPES.BUILDABLE,
		speed: 0,
		meshBuilder: {
			...Unit.defaults.meshBuilder,
			shape: "square" as "square" | "circle",
		},
	};

	requiresTilemap = toFootprint(this.collisionRadius, this.requiresPathing);
	blocksTilemap = toFootprint(this.collisionRadius, this.blocksPathing);
	structure = true;
	buildTime: number;
	owner!: Player;

	private static _buildAction: Action;

	static get buildAction(): Action {
		if (this._buildAction) return this._buildAction;
		this._buildAction = {
			name: this.name,
			hotkey: this.defaults.buildHotkey!,
			description: this.defaults.buildDescription,
			type: "build",
			obstruction: this,
		};

		return this._buildAction;
	}

	constructor({ buildTime = 1, ...props }: ObstructionProps<Resource>) {
		super({ ...Obstruction.clonedDefaults, ...props });

		this.health = Math.round(
			Math.max(this.maxHealth * INITIAL_OBSTRUCTION_PROGRESS, 1),
		);
		this.buildTime = buildTime;

		new GerminateComponent(this);
	}
}
