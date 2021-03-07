import { logLine } from "../core/logger";
import { Terrain } from "../engine/entities/Terrain";
// eslint-disable-next-line no-restricted-imports
import { Game } from "../engine/Game";
import { PathingMap } from "../engine/pathing/PathingMap";
import { nextColor } from "../engine/players/colors";
import { withMazingContest } from "./mazingContestContext";
import type {
	ConnectionEvent,
	MazingContestNetwork,
	NetworkEventCallback,
} from "./MazingContestNetwork";
import { MainLogic } from "./mechanisms/MainLogic";
import { patchInState, Player } from "./Player";
import { terrain } from "./terrain";
import type { Settings } from "./types";

export class MazingContest extends Game {
	static readonly isMazingContest = true;

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

	displayName = "Mazing Contest";
	protocol = "mazingcontest";

	constructor(network: MazingContestNetwork) {
		super(network);
		logLine("Creating MazingContest");
		withMazingContest(this, () => {
			this.addNetworkListener("init", (e) => this.onInit(e));

			// Received by the the upon someone connecting after the round ends
			this.addNetworkListener("state", (e) => this.onState(e));

			this.terrain = new Terrain(terrain);
			this.graphics.panTo(
				{ x: terrain.height / 2, y: terrain.width / 2 - 7 },
				0,
			);
			this.pathingMap = new PathingMap({
				pathing: terrain.pathing,
				layers: terrain.pathingCliffs.slice().reverse(),
				resolution: 2,
			});
			this.addMechanism(new MainLogic());
		});
	}

	private onInit: NetworkEventCallback["init"] = ({
		connections,
		state: { players: inputPlayers },
	}) => {
		if (connections === 0) this.synchronizationState = "synchronized";

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

	protected _update(e: { time: number }): void {
		super._update(e);

		const time = e.time / 1000;

		// Update is called for people who have recently joined
		// if (this.round) {
		// 	this.round.update(time);
		this.dispatchEvent("update", time);
		// 	return;
		// }

		// if (
		// 	this.players.length &&
		// 	this.receivedState &&
		// 	(!this.lastRoundEnd || time > this.lastRoundEnd + 2)
		// )
		// 	this.start({ time });
	}

	render(): void {
		withMazingContest(this, () => this._render());
	}

	update(e: { time: number }): void {
		withMazingContest(this, () => this._update(e));
	}

	toJSON(): ReturnType<Game["toJSON"]> & {
		players: ReturnType<Player["toJSON"]>[];
	} {
		return {
			...super.toJSON(),
			players: this.players.map((p) => p.toJSON()),
		};
	}
}
