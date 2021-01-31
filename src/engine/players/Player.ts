import { Sprite } from "../entities/widgets/Sprite";
import { Unit } from "../entities/widgets/sprites/Unit";
import { Game } from "../Game";
import { currentGame } from "../gameContext";
import { Resource, resourceKeys, ResourceMap } from "../types";
import { Color, colors, releaseColor, takeColor } from "./colors";

export interface PlayerState {
	color: number | undefined;
	id: number;
	username: string;
}

export class Player {
	game: Game;
	sprites: Array<Sprite> = [];
	isHere = true;
	resources = { essence: 0 };
	username = "tim";
	id = -1;
	color?: Color;
	unit?: Unit;

	constructor({ game, ...data }: Partial<Player> & { game: Game }) {
		this.game = game;
		Object.assign(this, data);

		if (!data.username || parseInt(data.username) === data.id)
			Object.defineProperty(this, "username", {
				get: () => (this.color ? this.color.name : this.id),
			});

		// placeholder player (solo)
		if (data.id !== -1) game.players.push(this);
	}

	checkResources(resources: ResourceMap): Resource[] {
		const low: Resource[] = [];
		for (const resource of resourceKeys)
			if (this.resources[resource] < resources[resource])
				low.push(resource);

		return low;
	}

	subtractResources(resources: ResourceMap): void {
		for (const resource of resourceKeys)
			this.resources[resource] -= resources[resource];
	}

	get enemies(): Player[] {
		const game = currentGame();
		return game.players.filter((p) => game.alliances.isEnemy(this, p));
	}

	isEnemy(player: Player): boolean {
		return currentGame().alliances.isEnemy(this, player);
	}

	getEnemySprites(): Sprite[] {
		return this.enemies
			.map((p) => p.sprites.filter((s) => s.isAlive))
			.flat();
	}

	get uid(): string {
		return `${this.username}#${this.id}`;
	}

	toJSON(): PlayerState {
		return {
			color: this.color ? colors.indexOf(this.color) : undefined,
			id: this.id,
			username: this.username,
		};
	}
}

export const patchInState = (game: Game, playersState: PlayerState[]): void => {
	playersState.forEach(({ color, id, ...playerData }) => {
		const player =
			game.players.find((p) => p.id === id) ??
			new Player({ ...playerData, id, game });

		if (
			color !== undefined &&
			(!player.color || player.color.index !== color)
		) {
			if (player.color) releaseColor(player.color);
			player.color = takeColor(color);
		}
	});
	game.players.sort((a, b) => a.id - b.id);
};
