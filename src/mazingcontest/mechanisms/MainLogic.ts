import { Mechanism } from "../../core/Merchanism";
import type { MazingContest } from "../MazingContest";
import { currentMazingContest } from "../mazingContestContext";

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
			lumber: Math.floor(Math.random() * Math.random() * 35),
		};

		// game.players.forEach((player) => {
		// 	new Builder();
		// });
	}

	update(delta: number, time: number): void {
		const game = currentMazingContest();

		if (!this.round && game.players.length > 0) this.startRound(time, game);
	}
}
