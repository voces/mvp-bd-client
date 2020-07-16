import { dragSelect } from "./dragSelect.js";
import { WORLD_TO_GRAPHICS_RATIO } from "../constants.js";
import { Sprite, SpriteProps, SpriteEvents } from "./Sprite.js";
import { Point } from "../pathing/PathingMap.js";
import { Player } from "../players/Player.js";
import { attack } from "./activities/attack.js";
import { Emitter } from "../emitter.js";
import { Action } from "./spriteLogic.js";
import { Obstruction } from "./obstructions/index.js";
import {
	active as activeObstructionPlacement,
	stop as hideObstructionPlacement,
} from "./obstructionPlacement.js";
import { MoveTargetManager, MoveTarget } from "../components/MoveTarget.js";
import { AttackTargetManager } from "../components/AttackTarget.js";

const holdPosition: Action = {
	name: "Hold Position",
	hotkey: "h" as const,
	type: "custom" as const,
	handler: ({ player }): void => {
		if (!player.game.round) return;

		const ownedUnits = dragSelect.selection.filter(
			(u) => u.owner === player && Unit.isUnit(u) && u.speed > 0,
		);

		player.game.transmit({
			type: "holdPosition",
			sprites: ownedUnits.map((u) => u.id),
		});
	},
};

const stop: Action = {
	name: "Stop",
	hotkey: "s" as const,
	type: "custom" as const,
	handler: ({ player }): void => {
		if (!player.game.round) return;

		const ownedUnits = dragSelect.selection.filter(
			(u) => u.owner === player && Unit.isUnit(u),
		);

		player.game.transmit({
			type: "stop",
			sprites: ownedUnits.map((u) => u.id),
		});
	},
};

const cancel = {
	name: "Cancel",
	hotkey: "Escape" as const,
	type: "custom" as const,
	handler: (): void => {
		if (activeObstructionPlacement()) hideObstructionPlacement();
	},
};

export type Weapon = {
	damage: number;
	cooldown: number;
	range: number;
	projectile:
		| "instant"
		| (<T extends Sprite>(target: Sprite, attacker: T) => void);
	last: number;
	enabled: boolean;
	onDamage?: (target: Sprite, damage: number, attacker: Sprite) => void;
};

export type UnitProps = Omit<SpriteProps, "game"> & {
	isIllusion?: boolean;
	owner: Player;
	speed?: number;
	weapon?: Weapon;
	name?: string;
	builds?: typeof Obstruction[];
};

// `Seeing Class extends value undefined is not a constructor or null`? Import
// Player before Sprite.
class Unit extends Sprite {
	static isUnit = (sprite: Sprite): sprite is Unit => sprite instanceof Unit;

	static defaults = {
		...Sprite.defaults,
		isIllusion: false,
		// 380 in WC3
		speed: 5.938,
	};

	autoAttack?: boolean;
	isIllusion: boolean;
	mirrors?: Unit[];
	owner!: Player;
	speed: number;
	weapon?: Weapon;
	name: string;
	builds: typeof Obstruction[];

	constructor({
		isIllusion = Unit.defaults.isIllusion,
		name,
		speed = Unit.defaults.speed,
		weapon,
		builds = [],
		...props
	}: UnitProps) {
		const game = props.owner.game;
		super({
			game,
			...props,
		});

		this.isIllusion = isIllusion;
		this.name = name ?? this.constructor.name;
		this.speed = speed;
		this.weapon = weapon;
		this.builds = builds;

		if (this.html?.htmlElement) {
			if (
				this.isIllusion &&
				game.localPlayer &&
				game.localPlayer.unit &&
				this.round.defenders.includes(game.localPlayer)
			)
				this.html.htmlElement.style.backgroundImage =
					"radial-gradient(rgba(0, 0, 255, 0.75), rgba(0, 0, 255, 0.75))";
			this.html.htmlElement.style.borderRadius =
				this.radius * WORLD_TO_GRAPHICS_RATIO + "px";
		}
	}

	attack(target: Sprite): void {
		if (this.weapon?.enabled) attack(this, target);
	}

	walkTo(target: Point): void {
		MoveTargetManager.set(this, new MoveTarget({ entity: this, target }));
		AttackTargetManager.delete(this);
	}

	holdPosition(): void {
		this.activity = { toJSON: () => ({ name: "hold" }) };
		MoveTargetManager.delete(this);
		AttackTargetManager.delete(this);
	}

	stop(): void {
		this.activity = undefined;
		MoveTargetManager.delete(this);
		AttackTargetManager.delete(this);
	}

	get actions(): Action[] {
		const buildList = this.builds.map((klass) => klass.buildAction);
		if (buildList.length > 0) buildList.push(cancel);

		const actions: Action[] = buildList;

		if (this.speed > 0) actions.push(holdPosition, stop);

		return actions;
	}

	toJSON(): ReturnType<typeof Sprite.prototype.toJSON> {
		return {
			...super.toJSON(),
		};
	}
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
type UnitEvents = SpriteEvents;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Unit extends Emitter<UnitEvents> {}

export { Unit };
