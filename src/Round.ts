import { arenas } from "./arenas/index.js";
import { PathingMap } from "./pathing/PathingMap.js";
import { TILE_TYPES, TileType } from "./constants.js";
import { Crosser } from "./sprites/Crosser.js";
import { Defender } from "./sprites/Defender.js";
import { dragSelect } from "./sprites/dragSelect.js";
import { elo, updateDisplay } from "./players/elo.js";
import { emitter, Emitter } from "./emitter.js";
import { panTo } from "./players/camera.js";
import { Player } from "./players/Player.js";
import { colors } from "./players/colors.js";
import { requestAnimationFrame, cancelAnimationFrame } from "./util/globals.js";
import { Resource } from "./sprites/obstructions/index.js";
import { Settings, teamKeys, resourceKeys } from "./types.js";
import { Arena } from "./arenas/types.js";
import { Unit } from "./sprites/Unit.js";
import { Sprite } from "./sprites/Sprite.js";
import { Game } from "./Game.js";
import { MoveTargetManager } from "./components/MoveTarget.js";
import { AttackTargetManager } from "./components/AttackTarget.js";
import { HoldPositionManager } from "./components/HoldPositionComponent.js";

let placeholderPlayer: Player;

type Interval = {
	fn: () => void;
	next: number;
	interval: number;
	oncePerUpdate: boolean;
	id: number;
};

type Timeout = {
	fn: () => void;
	next: number;
	id: number;
};

type IntervalId = number;
type TimeoutId = number;

// A round starts upon construction
class Round {
	game: Game;
	players: Player[];
	crossers: Player[] = [];
	defenders: Player[] = [];
	sprites: Sprite[] = [];
	scores = 0;
	spriteId = 0;
	// Replace with a heap
	intervals: Interval[] = [];
	nextIntervalId = 0;
	timeouts: Timeout[] = [];
	nextTimeoutId = 0;

	lastUpdate: number;
	lastRender: number;
	settings: Settings;
	arena: Arena;
	pathingMap: PathingMap;
	expireAt: number;
	requestedAnimationFrame?: number;

	constructor({
		time,
		settings,
		players,
		game,
	}: {
		time: number;
		settings: Settings;
		players: Player[];
		game: Game;
	}) {
		emitter(this);
		this.game = game;
		// We set this for downstream constructor logic
		this.game.round = this;
		this.lastUpdate = time;
		this.lastRender = Date.now() / 1000;
		this.settings = settings;
		this.players = [...players];
		this.arena = arenas[settings.arenaIndex];
		this.pathingMap = new PathingMap({
			pathing: this.arena.pathing,
			layers: this.arena.layers,
			resolution: 2,
		});
		this.expireAt = time + settings.duration;

		if (!placeholderPlayer)
			placeholderPlayer = new Player({
				color: colors.white,
				id: -1,
				score: { bulldog: 800 },
				game,
			});

		this.pickTeams();
		this.grantResources();
		this.spawnUnits();
		this.startRendering();
	}

	pickTeams(): void {
		if (this.players.length === 1) this.players.push(placeholderPlayer);

		const remaining = [...this.players];
		while (remaining.length) {
			const lowPlays = Math.min(...remaining.map((p) => p.crosserPlays));
			const low = remaining.filter((p) => p.crosserPlays === lowPlays);

			const player = low.splice(
				Math.floor(this.game.random() * low.length),
				1,
			)[0];
			remaining.splice(remaining.indexOf(player), 1);
			if (this.crossers.length < this.settings.crossers) {
				this.crossers.push(player);
				player.crosserPlays++;
			} else this.defenders.push(player);
		}

		updateDisplay(this.game);
	}

	grantResources(): void {
		for (const team of teamKeys)
			if (team in this.settings.resources)
				this[team].forEach((player) => {
					for (const resource of resourceKeys)
						player.resources[resource] = this.settings.resources[
							team
						][resource].starting;
				});
	}

	_spawnUnit(
		player: Player,
		UnitClass: typeof Unit,
		targetTile: TileType,
	): void {
		// Create the unit
		const unit = (player.unit = new UnitClass({
			owner: player,
			x: 0,
			y: 0,
		}));

		// Place it
		let maxTries = 8192;
		while (--maxTries) {
			const xRand = this.game.random() * this.pathingMap.widthWorld;
			const yRand = this.game.random() * this.pathingMap.heightWorld;

			if (
				this.arena.tiles[Math.floor(yRand)][Math.floor(xRand)] !==
				targetTile
			)
				continue;

			const { x, y } = this.pathingMap.nearestSpiralPathing(
				xRand,
				yRand,
				unit,
			);

			if (this.arena.tiles[Math.floor(y)][Math.floor(x)] === targetTile) {
				unit.position.setXY(x, y);
				this.pathingMap.addEntity(unit);

				break;
			}
		}

		if (!maxTries) console.error("Exhausted placement attempts");

		// Select + pan to it
		if (player === this.game.localPlayer) {
			dragSelect.setSelection([unit]);
			panTo(unit.position);
		}

		// Add event listeners
		if (player)
			unit.addEventListener("death", () => {
				player.unit = undefined;
				if (unit instanceof Crosser) this.onCrosserRemoval();
			});
	}

	spawnUnits(): void {
		this.players.forEach((player) => {
			const isCrosser = this.crossers.includes(player);
			const targetTile = isCrosser ? TILE_TYPES.START : TILE_TYPES.SPAWN;
			const Unit = isCrosser ? Crosser : Defender;
			this._spawnUnit(player, Unit, targetTile);
		});
	}

	onCrosserRemoval(): void {
		if (this.crossers.some((p) => p.unit && p.unit.health > 0)) return;

		this.end();
	}

	end(): void {
		elo({
			mode: this.game.settings.mode,
			crossers: this.crossers,
			defenders: this.defenders,
			scores: this.scores,
			game: this.game,
		});

		const placeholderIndex = this.game.players.indexOf(placeholderPlayer);
		if (placeholderIndex >= 0)
			this.game.players.splice(placeholderIndex, 1);

		if (this.game.newPlayers) {
			this.game.newPlayers = false;
			this.game.receivedState = false;

			if (this.game.isHost)
				this.game.transmit({
					type: "state",
					state: this.game,
				});
		} else this.game.lastRoundEnd = this.game.lastUpdate;

		this.setTimeout(() => {
			[...this.sprites].forEach((sprite) => sprite.kill());
			if (this.requestedAnimationFrame)
				cancelAnimationFrame(this.requestedAnimationFrame);

			this.setTimeout(() => {
				this.removeEventListeners();
				this.game.round = undefined;
			}, 0.25);
		}, 1);
	}

	setInterval(
		fn: () => void,
		interval = 0.05,
		oncePerUpdate = true,
	): IntervalId {
		const id = this.nextIntervalId;

		this.intervals.push({
			fn,
			next: this.lastUpdate + interval,
			interval,
			oncePerUpdate,
			id,
		});

		this.nextIntervalId = id + 1;

		return id;
	}

	clearInterval(id: number): void {
		const index = this.intervals.findIndex((i) => i.id === id);
		if (index >= 0) this.intervals.splice(index, 1);
	}

	setTimeout(fn: () => void, timeout = 0.05): TimeoutId {
		const id = this.nextTimeoutId;

		this.timeouts.push({ fn, next: this.lastUpdate + timeout, id });

		this.nextTimeoutId = id + 1;

		return id;
	}

	clearTimeout(id: number): void {
		const index = this.timeouts.findIndex((i) => i.id === id);
		if (index >= 0) this.timeouts.splice(index, 1);
	}

	onPlayerLeave(/* player: Player */): void {
		if (this.players.some((player) => player.isHere)) return;

		this.game.round = undefined;
	}

	updateSprites(delta: number): void {
		this.sprites.forEach((sprite) => {
			if (sprite.activity)
				sprite.activity.update && sprite.activity.update(delta);
			else if (
				Unit.isUnit(sprite) &&
				sprite.autoAttack &&
				sprite.weapon &&
				!MoveTargetManager.has(sprite) &&
				!AttackTargetManager.has(sprite) &&
				!HoldPositionManager.has(sprite)
			) {
				const {
					position: { x, y },
					weapon,
				} = sprite;

				const pool = sprite.owner
					.getEnemySprites()
					.filter((s) => Number.isFinite(s.health))
					.sort((a, b) => {
						// Prefer priority
						if (a.priority !== b.priority)
							return b.priority - a.priority;

						return (
							(a.position.x - x) ** 2 +
							(a.position.y - y) ** 2 -
							((b.position.x - x) ** 2 + (b.position.y - y) ** 2)
						);
					});

				const nearest =
					pool.find((u) => {
						// If unit in range, that's it
						const distanceToTarget = Math.sqrt(
							(u.position.x - sprite.position.x) ** 2 +
								(u.position.y - sprite.position.y) ** 2,
						);
						if (
							distanceToTarget <
							weapon.range + sprite.radius + u.radius
						)
							return true;

						// Otherwise, make sure we can get to it
						if (sprite.speed) {
							const endPoint = this.pathingMap
								.withoutEntity(u, () =>
									this.pathingMap.path(sprite, u.position),
								)
								.pop();
							if (!endPoint) return false;

							const distance = Math.sqrt(
								(endPoint.x - u.position.x) ** 2 +
									(endPoint.y - u.position.y) ** 2,
							);

							if (
								distance <
								weapon.range + sprite.radius + u.radius
							)
								return true;
						}

						return false;
					}) || pool[0];

				if (nearest) sprite.attack(nearest);
			}

			if (sprite instanceof Crosser)
				if (
					this.arena.tiles[Math.floor(sprite.position.y)][
						Math.floor(sprite.position.x)
					] === TILE_TYPES.END
				) {
					sprite.ascend();
					this.scores++;
					sprite.owner.unit = undefined;

					this.onCrosserRemoval();
				}
		});
	}

	updateIntervals(time: number): void {
		this.intervals.sort((a, b) => a.next - b.next);
		const intervals = [...this.intervals];
		let intervalIndex = 0;
		while (
			intervals[intervalIndex] &&
			intervals[intervalIndex].next < time
		) {
			const interval = intervals[intervalIndex];
			interval.next = interval.oncePerUpdate
				? time + interval.interval
				: interval.next + interval.interval;
			interval.fn();
			if (interval.oncePerUpdate || interval.next > time) intervalIndex++;
		}
	}

	updateTimeouts(time: number): void {
		this.timeouts.sort((a, b) => a.next - b.next);
		const timeouts = [...this.timeouts];
		let timeoutIndex = 0;
		while (timeouts[timeoutIndex] && timeouts[timeoutIndex].next < time) {
			const timeout = timeouts[timeoutIndex];
			timeout.fn();
			timeoutIndex++;
			const index = this.timeouts.indexOf(timeout);
			if (index >= 0) this.timeouts.splice(index, 1);
		}
	}

	updateResources(delta: number): void {
		const factor =
			this.crossers.reduce(
				(sum, p) =>
					sum +
					p.sprites.reduce(
						(sum, s) => sum + (s instanceof Resource ? 1 : 0),
						0,
					),
				1,
			) / 2;

		for (const team of teamKeys)
			if (team in this.settings.resources)
				this[team].forEach((player) => {
					for (const resource of resourceKeys)
						player.resources[resource] +=
							this.settings.resources[team][resource].rate *
							delta *
							factor;
				});
	}

	update(time: number): void {
		// meta info
		const delta = time - this.lastUpdate;
		if (isNaN(delta)) throw new Error(`delta=${delta}`);
		this.lastUpdate = time;

		// End of round
		if (time > this.expireAt)
			this.crossers.forEach((c) => c.unit && c.unit.kill());

		this.updateSprites(delta);
		this.updateIntervals(time);
		this.updateTimeouts(time);
		this.updateResources(delta);
	}

	render(): void {
		this.requestedAnimationFrame = requestAnimationFrame(() =>
			this.render(),
		);
		const newRender = Date.now();
		const delta = (newRender - this.lastRender) / 1000;
		this.lastRender = newRender;

		this.sprites.forEach(
			(sprite) =>
				sprite.activity &&
				sprite.activity.render &&
				sprite.activity.render(delta),
		);
	}

	startRendering(): void {
		this.requestedAnimationFrame = requestAnimationFrame(() =>
			this.render(),
		);
	}

	toJSON(): {
		crossers: number[];
		defenders: number[];
		expireAt: number;
		lastUpdate: number;
		sprites: ReturnType<typeof Sprite.prototype.toJSON>[];
	} {
		return {
			crossers: this.crossers.map((c) => c.id),
			defenders: this.defenders.map((d) => d.id),
			expireAt: this.expireAt,
			lastUpdate: this.lastUpdate,
			sprites: this.sprites.map((s) => s.toJSON()),
		};
	}
}

type RoundEvents = {
	empty: never;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Round extends Emitter<RoundEvents> {}

export { Round };
