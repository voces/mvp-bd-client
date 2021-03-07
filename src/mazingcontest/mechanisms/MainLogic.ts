import { Mechanism } from "../../core/Merchanism";
import { Builder } from "../entities/Builder";
import type { MazingContest } from "../MazingContest";
import { currentMazingContest } from "../mazingContestContext";
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
				? Math.floor(Math.random() * Math.random() * 4)
				: 0,
			lumber: Math.ceil(Math.random() * Math.random() * 35),
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
	}

	update(delta: number, time: number): void {
		const game = currentMazingContest();

		if (!this.round && game.players.length > 0) this.startRound(time, game);
	}
}
