import { arenas } from "./arenas/index";
import { Round } from "./Round";
import { emitter, Emitter } from "./emitter";
import { document } from "./util/globals";
import { Player, patchInState } from "./players/Player";
import { Arena } from "./arenas/types";
import { alea } from "./lib/alea";
import { Settings } from "./types";
import { emptyElement } from "./util/html";
import { Network, NetworkEventCallback } from "./Network";
import { UI } from "./ui/index";
import { initObstructionPlacement } from "./entities/sprites/obstructionPlacement";
import { initPlayerLogic } from "./players/playerLogic";
import { initSpriteLogicListeners } from "./entities/sprites/spriteLogic";
import { App } from "./core/App";
// import { HTMLGraphics } from "./systems/HTMLGraphics";
import { MoveSystem } from "./systems/MoveSystem";
import { AttackSystem } from "./systems/AttackSystem";
import { BlueprintSystem } from "./systems/BlueprintSystem";
import { ProjectileSystem } from "./systems/ProjectileSystem";
import { GerminateSystem } from "./systems/GerminateSystem";
import { AutoAttackSystem } from "./systems/AutoAttackSystem";
import { AnimationSystem } from "./systems/AnimationSystem";
import { SelectedSystem } from "./systems/SelectedSystem";
import { MeshBuilder } from "./systems/MeshBuilder";
// import { Terrain as TerrainMesh } from "notextures";
import { Terrain } from "./entities/Terrain";
import { ThreeGraphics } from "./systems/ThreeGraphics";

const tilesElemnt = document.getElementById("tiles")!;

class Game extends App {
	private network: Network;
	addNetworkListener: Network["addEventListener"];
	connect: Network["connect"];

	ui: UI;

	localPlayer!: Player;
	host?: Player;
	players: Player[] = [];
	arena: Arena = arenas[0];
	receivedState: false | "init" | "state" | "host" = false;
	newPlayers = false;
	random = alea("");
	round?: Round;
	lastUpdate = 0;
	lastRoundEnd?: number;
	terrain?: Terrain;

	settings: Settings = {
		arenaIndex: -1,
		crossers: 1,
		duration: 120,
		mode: "bulldog",
		resources: {
			crossers: {
				essence: {
					starting: 100,
					rate: 1,
				},
			},
			defenders: { essence: { starting: 0, rate: 0 } },
		},
	};

	constructor(network: Network) {
		super();
		emitter(this);
		// this.addSystem(new HTMLGraphics());
		this.addSystem(new MoveSystem());
		this.addSystem(new AttackSystem());
		this.addSystem(new BlueprintSystem());
		this.addSystem(new ProjectileSystem());
		this.addSystem(new GerminateSystem());
		this.addSystem(new AutoAttackSystem());
		this.addSystem(new AnimationSystem());
		this.addSystem(new SelectedSystem());
		this.addSystem(new MeshBuilder());
		this.addSystem(new ThreeGraphics());

		this.network = network;
		this.addNetworkListener = this.network.addEventListener.bind(
			this.network,
		);
		this.connect = this.network.connect.bind(this.network);
		this.addNetworkListener("init", (e) => this.onInit(e));
		this.addNetworkListener("update", (e) => this.update(e));

		this.ui = new UI(this);
		initObstructionPlacement(this);
		initPlayerLogic(this);
		initSpriteLogicListeners(this);

		this.setArena(Math.floor(this.random() * arenas.length));
	}

	/* This should only be used by servers that need to rewrite bits. */
	public get __UNSAFE_network(): Network {
		return this.network;
	}

	transmit<T extends Record<string, unknown>>(data: T): void {
		this.network.send(data);
	}

	get isHost(): boolean {
		return this.network.isHost;
	}

	private onInit: NetworkEventCallback["init"] = ({
		connections,
		state: { players: inputPlayers, arena },
	}) => {
		if (connections === 0) this.receivedState = "init";

		this.setArena(arena);

		patchInState(this, inputPlayers);
	};

	setArena(arenaIndex: number): void {
		if (this.settings.arenaIndex === arenaIndex) return;

		this.settings.arenaIndex = arenaIndex;
		this.arena = arenas[arenaIndex];

		emptyElement(tilesElemnt);
		if (this.terrain) this.remove(this.terrain);
		this.terrain = new Terrain(this.arena);
		this.add(this.terrain);
		// for (let y = 0; y < this.arena.tiles.length; y++) {
		// 	const row = document.createElement("div");
		// 	row.classList.add("row");
		// 	for (let x = 0; x < this.arena.tiles[y].length; x++) {
		// 		const tile = document.createElement("div");
		// 		tile.classList.add(
		// 			"tile",
		// 			`layer-${this.arena.layers[y][x]}`,
		// 			TILE_NAMES[this.arena.tiles[y][x]] || "void",
		// 		);

		// 		tile.style.height = "32px";
		// 		tile.style.width = "32px";

		// 		if (
		// 			y !== 0 &&
		// 			this.arena.layers[y][x] < this.arena.layers[y - 1][x]
		// 		)
		// 			if (
		// 				this.arena.layers[y - 1][x] -
		// 					this.arena.layers[y][x] ===
		// 				1
		// 			) {
		// 				tile.style.backgroundColor = "transparent";
		// 				tile.style.backgroundImage = gradient(
		// 					"top",
		// 					this.arena.layers[y][x],
		// 					this.arena.layers[y - 1][x],
		// 				);
		// 			}

		// 		if (
		// 			y < this.arena.tiles.length - 1 &&
		// 			this.arena.layers[y][x] < this.arena.layers[y + 1][x]
		// 		)
		// 			if (
		// 				this.arena.layers[y + 1][x] -
		// 					this.arena.layers[y][x] ===
		// 				1
		// 			) {
		// 				tile.style.backgroundColor = "transparent";
		// 				tile.style.backgroundImage = gradient(
		// 					"bottom",
		// 					this.arena.layers[y][x],
		// 					this.arena.layers[y + 1][x],
		// 				);
		// 			}

		// 		if (
		// 			x !== 0 &&
		// 			this.arena.layers[y][x] < this.arena.layers[y][x - 1]
		// 		)
		// 			if (
		// 				this.arena.layers[y][x - 1] -
		// 					this.arena.layers[y][x] ===
		// 				1
		// 			) {
		// 				tile.style.backgroundColor = "transparent";
		// 				tile.style.backgroundImage = gradient(
		// 					"left",
		// 					this.arena.layers[y][x],
		// 					this.arena.layers[y][x - 1],
		// 				);
		// 			}

		// 		if (
		// 			x < this.arena.tiles[y].length - 1 &&
		// 			this.arena.layers[y][x] < this.arena.layers[y][x + 1]
		// 		)
		// 			if (
		// 				this.arena.layers[y][x + 1] -
		// 					this.arena.layers[y][x] ===
		// 				1
		// 			) {
		// 				tile.style.backgroundColor = "transparent";
		// 				tile.style.backgroundImage = gradient(
		// 					"right",
		// 					this.arena.layers[y][x],
		// 					this.arena.layers[y][x + 1],
		// 				);
		// 			}

		// 		row.appendChild(tile);
		// 	}

		// 	tilesElemnt.appendChild(row);
		// }

		this.graphics?.panTo(
			{
				x: this.arena.tiles[0].length / 2,
				y: this.arena.tiles.length / 2,
			},
			0,
		);
	}

	nextArena(): void {
		this.settings.arenaIndex =
			(this.settings.arenaIndex + 1) % arenas.length;
	}

	previousArena(): void {
		this.settings.arenaIndex = this.settings.arenaIndex
			? this.settings.arenaIndex - 1
			: arenas.length - 1;
	}

	get graphics(): ThreeGraphics | undefined {
		const sys = this.systems.find((s) => ThreeGraphics.isThreeGraphics(s));
		if (!sys) return;
		if (ThreeGraphics.isThreeGraphics(sys)) return sys;
	}

	start({ time }: { time: number }): void {
		if (this.round) throw new Error("A round is already in progress");

		const plays = this.players[0].crosserPlays;
		const newArena =
			plays >= 3 &&
			this.players.every(
				(p) => p.crosserPlays === plays || p.crosserPlays >= 5,
			);

		if (newArena) {
			this.setArena(Math.floor(this.random() * arenas.length));
			this.players.forEach((p) => (p.crosserPlays = 0));
		}

		this.settings.crossers =
			this.players.length === 3
				? 1 // hardcode 1v2
				: Math.ceil(this.players.length / 2); // otherwise just do 1v0, 1v1, 1v2, 2v2, 3v2, 3v3, 4v3, etc

		this.round = new Round({
			time,
			settings: this.settings,
			players: this.players,
			game: this,
		});
	}

	update(e: { time: number }): void {
		super.update(e);

		const time = e.time / 1000;
		this.lastUpdate = time;

		// Update is called for people who have recently joined
		if (this.round) {
			this.round.update(time);
			this.dispatchEvent("update", time);
			return;
		}

		if (
			this.players.length &&
			this.receivedState &&
			(!this.lastRoundEnd || time > this.lastRoundEnd + 2)
		)
			this.start({ time });
	}

	toJSON(): {
		arena: number;
		lastRoundEnd: number | undefined;
		lastUpdate: number;
		players: ReturnType<typeof Player.prototype.toJSON>[];
		round: ReturnType<typeof Round.prototype.toJSON> | undefined;
	} {
		return {
			arena: this.settings.arenaIndex,
			lastRoundEnd: this.lastRoundEnd,
			lastUpdate: this.lastUpdate,
			players: this.players.map((p) => p.toJSON()),
			round: this.round?.toJSON(),
		};
	}
}

type GameEvents = {
	update: (time: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Game extends Emitter<GameEvents>, App {}

export { Game };
