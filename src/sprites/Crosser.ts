import { Unit, UnitProps } from "./Unit.js";
import { dragSelect } from "./dragSelect.js";
import {
	stop as stopPlacement,
	active as activePlacement,
} from "./obstructionPlacement.js";
import { appendErrorMessage } from "../ui/chat.js";
import { Point } from "../pathing/PathingMap.js";
import { Sprite } from "./Sprite.js";
import {
	Obstruction,
	ObstructionSubclass,
	Basic,
	Dense,
	Huge,
	Large,
	Resource,
	Slow,
	Stack,
	Tiny,
} from "./obstructions/index.js";
import { Blueprint } from "./obstructions/Blueprint.js";
import { Action } from "./spriteLogic.js";
import { MoveTargetManager, MoveTarget } from "../components/MoveTarget.js";

const destroyLastBox: Action = {
	name: "Destroy box",
	description: "Destroys selected or last created box",
	hotkey: "x" as const,
	type: "custom" as const,
	handler: ({ player }): void => {
		const crosser = player.unit;
		if (!crosser || !Crosser.isCrosser(crosser)) return;
		const obstructions = [...crosser.obstructions];
		while (obstructions.length) {
			const obstruction = obstructions.pop();
			if (obstruction && obstruction.health > 0) {
				player.game.transmit({
					type: "kill",
					sprites: [obstruction.id],
				});
				break;
			}
		}
	},
};

// Inclusive of unit radius, allowing for "jumping"
const BUILD_DISTANCE = 1.4;

export class Crosser extends Unit {
	static isCrosser = (sprite: Sprite): sprite is Crosser =>
		sprite instanceof Crosser;

	static defaults = {
		...Unit.defaults,
		priority: 1,
		radius: 0.5,
		builds: [Basic, Dense, Huge, Large, Resource, Slow, Stack, Tiny],
	};

	// 380 in WC3 on fast
	speed = 5.9375;
	obstructions: Obstruction[] = [];

	constructor(props: UnitProps) {
		super({ ...Crosser.clonedDefaults, ...props });

		this.addEventListener("death", () => {
			// Kill all their sprites
			[...this.owner.sprites].forEach((sprite) => sprite.kill());

			// Cancel any active placements
			if (activePlacement()) stopPlacement();
		});
	}

	buildAt(target: Point, ObstructionClass: ObstructionSubclass): void {
		const moveTarget = new MoveTarget({
			entity: this,
			target,
			distance: BUILD_DISTANCE - 1e-7,
		});

		MoveTargetManager.set(this, moveTarget);

		const blueprint =
			this.owner === this.game.localPlayer
				? new Blueprint({
						...target,
						game: this.game,
						radius: ObstructionClass.defaults.radius,
				  })
				: undefined;

		const update = () => {
			const { x, y } = this.position;

			const distanceRemaining = Math.sqrt(
				(x - target.x) ** 2 + (y - target.y) ** 2,
			);
			if (distanceRemaining < BUILD_DISTANCE) {
				this.activity = undefined;
				MoveTargetManager.delete(this);

				if (ObstructionClass.defaults.cost) {
					const check = this.owner.checkResources(
						ObstructionClass.defaults.cost,
					);
					if (check?.length) {
						appendErrorMessage(`Not enough ${check.join(" ")}`);
						return;
					}

					this.owner.subtractResources(
						ObstructionClass.defaults.cost,
					);
				}

				const obstruction = new ObstructionClass({
					x: target.x,
					y: target.y,
					owner: this.owner,
				});

				this.round.pathingMap.withoutEntity(this, () => {
					if (
						this.round.pathingMap.pathable(
							obstruction,
							target.x,
							target.y,
						)
					) {
						this.round.pathingMap.addEntity(obstruction);
						this.obstructions.push(obstruction);
					} else obstruction.kill({ removeImmediately: true });

					const newPos = this.round.pathingMap.nearestSpiralPathing(
						x,
						y,
						this,
					);
					this.position.setXY(newPos.x, newPos.y);
				});
			}
		};

		this.activity = {
			update,
			cleanup: () =>
				blueprint && blueprint.kill({ removeImmediately: true }),
			toJSON: () => ({
				name: "buildAt",
				obstruction: Obstruction.name,
				target,
				path: moveTarget.path,
				ticks: moveTarget.ticks,
			}),
		};
	}

	ascend(): void {
		this._health = 0;
		this.activity = undefined;
		dragSelect.removeSelectables([this]);
		if (this._selected)
			dragSelect.setSelection(
				dragSelect.selection.filter((u) => u !== this),
			);
		if (this.owner) {
			const index = this.owner.sprites.indexOf(this);
			if (index >= 0) this.owner.sprites.splice(index, 1);
		}

		this.round.pathingMap.removeEntity(this);
		const index = this.round.sprites.indexOf(this);
		if (index >= 0) this.round.sprites.splice(index, 1);

		// Cancel any active placements
		if (activePlacement()) stopPlacement();

		if (this.html?.htmlElement)
			this.html.htmlElement.classList.add("ascend");

		this.round.setTimeout(() => this.remove(), 1);
	}

	get actions(): Action[] {
		const actions = super.actions;
		actions.push(destroyLastBox);
		return actions;
	}
}
