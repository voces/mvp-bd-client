import { Animation } from "../../engine/components/graphics/Animation";
import { MeshBuilderComponent } from "../../engine/components/graphics/MeshBuilderComponent";
import { Hover } from "../../engine/components/Hover";
import { Selected } from "../../engine/components/Selected";
import { Sprite } from "../../engine/entities/widgets/Sprite";
import { Unit, UnitProps } from "../../engine/entities/widgets/sprites/Unit";
import { Obstruction } from "../../engine/entities/widgets/sprites/units/Obstruction";
import { currentGame } from "../../engine/gameContext";
import { Action } from "../../entities/sprites/spriteLogic";
import {
	Basic,
	Dense,
	Huge,
	Large,
	Resource,
	Slow,
	Stack,
	Tiny,
} from "./obstructions/index";

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

export class Crosser extends Unit {
	static isCrosser = (sprite: Sprite): sprite is Crosser =>
		sprite instanceof Crosser;

	static defaults = {
		...Unit.defaults,
		priority: 1,
		collisionRadius: 0.5,
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
			currentGame().obstructionPlacement?.stop();
		});
	}

	ascend(): void {
		this.invulnerable = true;
		if (this.owner) {
			const index = this.owner.sprites.indexOf(this);
			if (index >= 0) this.owner.sprites.splice(index, 1);
		}

		// Active components we want to clear right away
		this.stop();
		this.clear(Selected);
		this.clear(Hover);

		const game = currentGame();

		game.pathingMap.removeEntity(this);

		// Cancel any active placements
		game.obstructionPlacement?.stop();

		const meshBuilderComponent = this.get(MeshBuilderComponent)[0];
		if (meshBuilderComponent) new Animation(this, "ascend", 1);

		game.setTimeout(() => this.remove(), 1);
	}

	get actions(): Action[] {
		const actions = super.actions;
		actions.push(destroyLastBox);
		return actions;
	}
}
