import { Mechanism } from "../../core/Merchanism";
import { Builder } from "../entities/Builder";
import { Checkpoint } from "../entities/Checkpoint";
import type { MazingContest } from "../MazingContest";
import { currentMazingContest } from "../mazingContestContext";
import { getPlaceholderPlayer } from "../players/placeholder";
import { terrain } from "../terrain";

interface Obstruction {
	type: "thunder" | "block";
	x: number;
	y: number;
}

export class MainLogic extends Mechanism {
	phase: "idle" | "build" | "run" = "idle";
	round?: {
		start: number;
		buildTime: number;
		initial: Obstruction[];
		lumber: number;
		gold: number;
	};

	private startRound(time: number, game: MazingContest) {
		this.round = {
			start: time,
			buildTime: game.settings.buildTime,
			initial: [],
			gold: game.settings.thunderTowers
				? Math.floor(game.random() * game.random() * 4)
				: 0,
			lumber: Math.ceil(game.random() * game.random() * 35),
		};

		for (const owner of game.players) {
			owner.resources.gold = this.round.gold;
			owner.resources.lumber = this.round.lumber;

			const u = new Builder({
				x: terrain.width / 2,
				y: terrain.height / 2,
				owner,
			});

			if (owner === game.localPlayer) {
				game.selectionSystem.select(u);
				game.graphics.panTo(u.position, 0);
			}
		}

		if (game.settings.checkpoints) {
			const x =
				terrain.width / 2 +
				Math.round(game.random.between(-9, 8)) +
				0.5;
			const y =
				terrain.height / 2 +
				Math.round(game.random.between(-9, 8)) +
				0.5;

			const entity = new Checkpoint({
				x,
				y,
				owner: getPlaceholderPlayer(),
			});

			const newPos = game.pathingMap.nearestSpiralPathing(x, y, entity);

			if (game.pathingMap.pathable(entity, x, y)) {
				entity.position.setXY(newPos.x, newPos.y);

				game.pathingMap.addEntity(entity);
			} else entity.kill({ removeImmediately: true });
		}
	}

	update(delta: number, time: number): void {
		const game = currentMazingContest();

		if (!this.round && game.players.length > 0) this.startRound(time, game);
	}
}
