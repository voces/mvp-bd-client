import { logLine } from "../core/logger";
// eslint-disable-next-line no-restricted-imports
import { Game } from "../engine/Game";
import { nextColor } from "../engine/players/colors";
import { patchInState, Player } from "../engine/players/Player";
import { withMazingContest } from "./mazingContestContext";
import {
	ConnectionEvent,
	MazingContestNetwork,
	NetworkEventCallback,
} from "./MazingContestNetwork";
import { Settings } from "./types";

export class MazingContest extends Game {
	static readonly isKatma = true;

	localPlayer!: Player;
	players: Player[] = [];

	settings: Settings = {
		numberOfRounds: 10,
		buildTime: 60,
		thunderTowers: true,
		checkpoints: true,
	};

	addNetworkListener!: MazingContestNetwork["addEventListener"];
	removeNetworkListener!: MazingContestNetwork["removeEventListener"];

	constructor(network: MazingContestNetwork) {
		super(network);

		withMazingContest(this, () => {
			this.addNetworkListener("init", (e) => this.onInit(e));

			// Received by the the upon someone connecting after the round ends
			this.addNetworkListener("state", (e) => this.onState(e));
		});
	}

	private onInit: NetworkEventCallback["init"] = ({
		state: { players: inputPlayers },
	}) => {
		patchInState(this, inputPlayers);
	};

	///////////////////////
	// Entities
	///////////////////////

	onPlayerJoin(data: ConnectionEvent): Player {
		const player = new Player({
			color: nextColor(),
			game: this,
			id: data.connection,
			username: data.username,
		});

		return player;
	}

	private onState: NetworkEventCallback["state"] = ({
		time,
		state: { players: inputPlayers },
	}) => {
		this.update({ time });

		patchInState(this, inputPlayers);

		logLine("synchronized");
		this.synchronizationState = "synchronized";
	};

	// add(entity: Entity): boolean {
	// 	if (!super.add(entity)) return false;

	// 	return true;
	// }

	///////////////////////
	// Cycles
	///////////////////////

	// protected _update(e: { time: number }): void {
	// 	super._update(e);

	// 	// const time = e.time / 1000;

	// 	// Update is called for people who have recently joined
	// 	// if (this.round) {
	// 	// 	this.round.update(time);
	// 	// 	this.dispatchEvent("update", time);
	// 	// 	return;
	// 	// }

	// 	// if (
	// 	// 	this.players.length &&
	// 	// 	this.receivedState &&
	// 	// 	(!this.lastRoundEnd || time > this.lastRoundEnd + 2)
	// 	// )
	// 	// 	this.start({ time });
	// }

	render(): void {
		withMazingContest(this, () => this._render());
	}

	update(e: { time: number }): void {
		withMazingContest(this, () => this._update(e));
	}

	// toJSON(): ReturnType<Game["toJSON"]> & {
	// } {
	// 	return {
	// 		...super.toJSON(),
	// 	};
	// }
}
