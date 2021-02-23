import { Mechanism } from "../../core/Merchanism";
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

	update(delta: number, time: number): void {
		const game = currentMazingContest();
		console.log(game.players.length);

		if (!this.round && game.players.length > 0)
			this.round = {
				start: time,
				buildTime: 60,
				initial: [],
				lumber: Math.floor(Math.random() * Math.random() * 4),
				gold: Math.floor(Math.random() * Math.random() * 35),
			};
	}
}
