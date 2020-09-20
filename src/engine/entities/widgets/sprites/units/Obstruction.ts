import { Entity } from "../../../../../core/Entity";
import { Action } from "../../../../../entities/sprites/spriteLogic";
import { toFootprint } from "../../../../api/toFootprint";
import { GerminateComponent } from "../../../../components/GerminateComponent";
import {
	INITIAL_OBSTRUCTION_PROGRESS,
	PATHING_TYPES,
} from "../../../../constants";
import { Player } from "../../../../players/Player";
import { ResourceMap } from "../../../../types";
import { Unit, UnitProps } from "../Unit";

const destroySelf: Action = {
	name: "Destroy box",
	description: "Destroys selected boxes",
	hotkey: "x" as const,
	type: "custom" as const,
	handler: ({ player }): void => {
		// Get currently selected boxes
		const obstructions = player.game.selectionSystem.selection.filter(
			(s): s is Obstruction =>
				Obstruction.isObstruction(s) && s.owner === player,
		);

		// Select the main unit
		const playerCrosser = player.unit;
		if (playerCrosser)
			player.game.selectionSystem.setSelection([playerCrosser]);

		// Kill selected obstructions
		player.game.transmit({
			type: "kill",
			sprites: obstructions.map((u) => u.id),
		});
	},
};

export type ObstructionProps = UnitProps & {
	buildTime?: number;
	cost?: ResourceMap;
	owner: Player;
};

export class Obstruction extends Unit {
	static defaults = {
		...Unit.defaults,
		buildHotkey: undefined as Action["hotkey"] | undefined,
		buildDescription: undefined as string | undefined,
		cost: { essence: 1 },
		requiresPathing: PATHING_TYPES.WALKABLE | PATHING_TYPES.BUILDABLE,
		speed: 0,
		meshBuilder: {
			...Unit.defaults.meshBuilder,
			shape: "square" as "square" | "circle",
		},
	};

	static isObstruction = (entity: Entity): entity is Obstruction =>
		entity instanceof Obstruction;

	readonly isObstruction = true;
	requiresTilemap = toFootprint(this.collisionRadius, this.requiresPathing);
	blocksTilemap = toFootprint(this.collisionRadius, this.blocksPathing);
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

	constructor({ buildTime = 1, ...props }: ObstructionProps) {
		super({ ...Obstruction.clonedDefaults, ...props });

		this.health = Math.round(
			Math.min(this.maxHealth * INITIAL_OBSTRUCTION_PROGRESS, 1),
		);
		this.buildTime = buildTime;

		new GerminateComponent(this);
	}

	get actions(): Action[] {
		const actions = super.actions;
		actions.push(destroySelf);
		return actions;
	}
}
