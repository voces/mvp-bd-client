import { BinaryHeap } from "./BinaryHeap.js";
import { memoize } from "./memoize.js";
import { DIRECTION, PATHING_TYPES } from "../constants.js";
import { document } from "../util/globals.js";
import { emptyElement } from "../util/html.js";
import {
	polarProject,
	behind,
	infront,
	trueMinX,
	trueMaxX,
	offset,
} from "./math.js";

let debugging = false;
const elems: HTMLElement[] = [];
const arena = document.getElementById("arena")!;
export const toggleDebugging = (): void => {
	if (debugging) elems.forEach((elem) => arena.removeChild(elem));

	debugging = !debugging;
};

const DEFAULT_RESOLUTION = 1;

const MAX_TRIES = 8192;
const EPSILON = Number.EPSILON * 100;

type Pathing = number;

interface Entity {
	position: { x: number; y: number };
	requiresPathing?: Pathing;
	pathing?: Pathing;
	radius: number;
	requiresTilemap?: Footprint;
	blocksTilemap?: Footprint;
	blocksPathing?: Pathing;
	// todo: this seems unused?
	structure?: boolean;
}

export interface Footprint {
	top: number;
	left: number;
	height: number;
	width: number;
	map: number[];
}

class Tile {
	x: number;
	y: number;
	world: { x: number; y: number };
	/** The pathing of the tile without any entities on top of it. */
	originalPathing: Pathing;
	pathing: Pathing;
	nodes: Tile[];

	// nearestPathing
	__np?: number;
	__npTag?: number;

	// path
	__startRealPlusEstimatedCost?: number;
	__startTag?: number;
	__startRealCostFromOrigin?: number;
	__startEstimatedCostRemaining?: number;
	__startVisited?: boolean;
	__startClosed?: boolean;
	__startParent?: Tile | null;
	__endRealPlusEstimatedCost?: number;
	__endTag?: number;
	__endRealCostFromOrigin?: number;
	__endEstimatedCostRemaining?: number;
	__endVisited?: boolean;
	__endClosed?: boolean;
	__endParent?: Tile | null;

	/** Maps an entity to their pathing on this tile */
	private entities: Map<Entity, Pathing> = new Map();

	constructor(
		xTile: number,
		yTile: number,
		xWorld: number,
		yWorld: number,
		pathing: Pathing,
	) {
		this.x = xTile;
		this.y = yTile;
		this.world = { x: xWorld, y: yWorld };
		this.pathing = this.originalPathing = pathing;
		this.nodes = [];
	}

	addEntity(entity: Entity, pathing: Pathing): void {
		this.entities.set(entity, pathing);
		this.recalculatePathing();
	}

	removeEntity(entity: Entity): void {
		this.entities.delete(entity);
		this.recalculatePathing();
	}

	updateEntity(entity: Entity, pathing: Pathing): void {
		if (this.entities.get(entity) === pathing) return;
		this.addEntity(entity, pathing);
	}

	recalculatePathing(): void {
		this.pathing = this.originalPathing;
		this.entities.forEach((pathing) => (this.pathing |= pathing));
	}

	pathable(pathing: Pathing): boolean {
		return (this.pathing & pathing) === 0;
	}
}

export interface Point {
	x: number;
	y: number;
}

interface Cache {
	_linearPathable: (
		...args: Parameters<typeof PathingMap.prototype._linearPathable>
	) => ReturnType<typeof PathingMap.prototype._linearPathable>;
	_pathable: (
		...args: Parameters<typeof PathingMap.prototype._pathable>
	) => ReturnType<typeof PathingMap.prototype._pathable>;
	pointToTilemap: (
		...args: Parameters<typeof PathingMap.prototype.pointToTilemap>
	) => ReturnType<typeof PathingMap.prototype.pointToTilemap>;
}

//   0,   0, 255 = 0
//   0, 255, 255 = 0.25
//   0, 255,   0 = 0.5
// 255, 255,   0 = 0.75
// 255,   0,   0 = 1
const r = (v: number) => (v < 0.5 ? 0 : v < 0.75 ? (v - 0.5) * 4 : 1);
const g = (v: number) => (v < 0.25 ? v * 4 : v < 0.75 ? 1 : (1 - v) * 4);
const b = (v: number) => (v < 0.25 ? 1 : v < 0.5 ? (0.5 - v) * 4 : 0);

const placeTile = (x: number, y: number, v: number) => {
	const div = document.createElement("div");
	div.style.position = "absolute";
	div.style.top = y * 16 + "px";
	div.style.left = x * 16 + "px";
	div.style.zIndex = "10000";
	div.style.width = "16px";
	div.style.height = "16px";
	div.style.background = `rgba(${r(v) * 255}, ${g(v) * 255}, ${
		b(v) * 255
	}, 0.5)`;
	// div.cell = this.grid[ y ][ x ];
	arena.appendChild(div);
	elems.push(div);
};

// eslint-disable-next-line no-unused-vars
export class PathingMap {
	resolution: number;
	private layers?: number[][];
	heightWorld: number;
	widthWorld: number;
	heightMap: number;
	widthMap: number;
	readonly grid: Tile[][];

	// debugging
	private _elem?: HTMLDivElement;

	// Maps entities to tiles
	private entities: Map<Entity, Tile[]> = new Map();

	constructor({
		pathing,
		resolution = DEFAULT_RESOLUTION,
		layers,
	}: {
		pathing: Pathing[][];
		resolution?: number;
		layers?: number[][];
	}) {
		this.resolution = resolution;

		this.layers = layers;

		this.heightWorld = pathing.length;
		this.widthWorld = pathing[0].length;

		this.heightMap = this.heightWorld * this.resolution;
		this.widthMap = this.widthWorld * this.resolution;

		this.grid = [];
		// Create tiles
		for (let y = 0; y < pathing.length; y++)
			for (let x = 0; x < pathing[y].length; x++)
				for (let y2 = 0; y2 < this.resolution; y2++) {
					if (!this.grid[y * this.resolution + y2])
						this.grid[y * this.resolution + y2] = [];

					for (let x2 = 0; x2 < this.resolution; x2++) {
						const tile = new Tile(
							x * this.resolution + x2,
							y * this.resolution + y2,
							x + x2 / this.resolution,
							y + y2 / this.resolution,
							pathing[y][x],
						);
						this.grid[y * this.resolution + y2][
							x * this.resolution + x2
						] = tile;
					}
				}

		// Tell them about each other
		for (let y = 0; y < this.grid.length; y++)
			for (let x = 0; x < this.grid[y].length; x++) {
				const nodes: Tile[] = this.grid[y][x].nodes;

				// Above
				if (y > 0) nodes.push(this.grid[y - 1][x]);
				// Left
				if (x > 0) nodes.push(this.grid[y][x - 1]);
				// Right
				if (x < this.widthMap - 1) nodes.push(this.grid[y][x + 1]);
				// Below
				if (y < this.heightMap - 1) nodes.push(this.grid[y + 1][x]);
			}
	}

	_pathable(
		map: Footprint,
		xTile: number,
		yTile: number,
		test?: (tile: Tile) => boolean,
	): boolean {
		if (
			xTile < 0 ||
			yTile < 0 ||
			xTile >= this.widthMap ||
			yTile >= this.heightMap
		)
			return false;

		let i = 0;

		for (let y = yTile + map.top; y < yTile + map.height + map.top; y++)
			for (
				let x = xTile + map.left;
				x < xTile + map.width + map.left;
				x++, i++
			)
				if (
					this.grid[y]?.[x] === undefined ||
					this.grid[y][x].pathing & map.map[i] ||
					(test && !test(this.grid[y][x]))
				)
					return false;

		return true;
	}

	pathable(entity: Entity, xWorld?: number, yWorld?: number): boolean {
		if (xWorld === undefined) xWorld = entity.position.x;
		if (yWorld === undefined) yWorld = entity.position.y;

		const xTile = this.xWorldToTile(xWorld);
		const yTile = this.yWorldToTile(yWorld);
		const map =
			entity.requiresTilemap ||
			this.pointToTilemap(xWorld, yWorld, entity.radius, {
				type:
					entity.requiresPathing === undefined
						? entity.pathing
						: entity.requiresPathing,
			});

		return this.withoutEntity(entity, () =>
			this._pathable(map, xTile, yTile),
		);
	}

	// Make this more efficient by storing known tiles
	withoutEntity<A>(entity: Entity, fn: () => A): A {
		const removed = this.entities.has(entity);
		if (removed) this.removeEntity(entity);

		const result = fn();

		if (removed) this.addEntity(entity);

		return result;
	}

	nearestPathing(
		xWorld: number,
		yWorld: number,
		entity: Entity,
		test?: (tile: Tile) => boolean,
	): Point {
		const tile = this.entityToTile(entity, { x: xWorld, y: yWorld });

		// If initial position is fine, push it
		if (
			this._pathable(
				entity.requiresTilemap ||
					this.pointToTilemap(xWorld, yWorld, entity.radius, {
						includeOutOfBounds: true,
						type:
							entity.requiresPathing === undefined
								? entity.pathing
								: entity.requiresPathing,
					}),
				tile.x,
				tile.y,
				test,
			)
		)
			return { x: xWorld, y: yWorld };

		// Calculate input from non-entity input
		const target = { x: xWorld, y: yWorld };

		// Calculate constants from entity
		const pathing =
			entity.requiresPathing === undefined
				? entity.pathing
				: entity.requiresPathing;
		if (pathing === undefined) throw "entity has no pathing";
		const minimalTilemap =
			entity.requiresTilemap ||
			this.pointToTilemap(entity.radius, entity.radius, entity.radius, {
				type: pathing,
			});
		const radiusOffset = entity.radius % (1 / this.resolution);
		const offset = (point: Point) => ({
			x: point.x + radiusOffset,
			y: point.y + radiusOffset,
		});

		// Create our heap
		const distance = (a: Point, b: Point) =>
			(b.x - a.x) ** 2 + (b.y - a.y) ** 2;
		const tag = Math.random();
		const heap = new BinaryHeap((node: Tile) => node.__np ?? 0);

		// Seed our heap
		const start = tile;
		start.__npTag = tag;
		start.__np = distance(target, offset(start.world));
		heap.push(start);

		// Find a node!
		while (heap.length) {
			const current = heap.pop();

			if (
				current.pathable(pathing) &&
				this._pathable(minimalTilemap, current.x, current.y, test)
			)
				return offset(current.world);

			current.nodes.forEach((neighbor) => {
				if (neighbor.__npTag === tag) return;
				neighbor.__npTag = tag;
				neighbor.__np = distance(target, offset(neighbor.world));

				heap.push(neighbor);
			});
		}

		// Found nothing, return input
		return { x: xWorld, y: yWorld };
	}

	private _layer(xTile: number, yTile: number): number | undefined {
		if (!this.layers) return;
		if (yTile < 0) return;

		xTile = Math.floor(xTile / this.resolution);
		yTile = Math.floor(yTile / this.resolution);

		if (this.layers.length <= yTile) return;
		return this.layers[yTile][xTile];
	}

	layer(xWorld: number, yWorld: number): number | undefined {
		if (!this.layers) return;
		if (yWorld < 0) return;

		xWorld = Math.floor(xWorld);
		yWorld = Math.floor(yWorld);

		if (this.layers.length <= yWorld) return;
		return this.layers[yWorld][xWorld];
	}

	nearestSpiralPathing(
		xWorld: number,
		yWorld: number,
		entity: Entity,
		layer = this.layer(xWorld, yWorld),
	): Point {
		const originalX = xWorld;
		const originalY = yWorld;

		let xTile = this.xWorldToTile(xWorld);
		let yTile = this.yWorldToTile(yWorld);

		let attemptLayer = this._layer(xTile, yTile);

		if (layer === attemptLayer)
			if (entity.requiresTilemap) {
				if (this._pathable(entity.requiresTilemap, xTile, yTile))
					return {
						x: this.xTileToWorld(xTile),
						y: this.yTileToWorld(yTile),
					};
			} else if (
				this._pathable(
					this.pointToTilemap(xWorld, yWorld, entity.radius, {
						includeOutOfBounds: true,
						type:
							entity.requiresPathing === undefined
								? entity.pathing
								: entity.requiresPathing,
					}),
					xTile,
					yTile,
				)
			)
				return { x: xWorld, y: yWorld };

		const xMiss = Math.abs(xWorld * this.resolution - xTile);
		const yMiss = Math.abs(yWorld * this.resolution - yTile);

		// todo mirror WC3 for equal misses
		// 0 down, 1 left, 2 up, 3 right
		let direction =
			Math.abs(0.5 - xMiss) > Math.abs(0.5 - yMiss)
				? xMiss < 0.5
					? DIRECTION.LEFT
					: DIRECTION.RIGHT
				: yMiss < 0.5 && yMiss > 0
				? DIRECTION.UP
				: DIRECTION.DOWN;

		let steps = 0;
		const stride = entity.structure ? 2 : 1;
		let initialSteps = 0;

		let remainingTries = MAX_TRIES;

		let minimalTilemap;
		let offset;
		if (entity.requiresTilemap) {
			minimalTilemap = entity.requiresTilemap;
			offset = {
				x: entity.requiresTilemap.left / this.resolution,
				y: entity.requiresTilemap.top / this.resolution,
			};
		} else {
			minimalTilemap = this.pointToTilemap(
				entity.radius,
				entity.radius,
				entity.radius,
				{
					type:
						entity.requiresPathing === undefined
							? entity.pathing
							: entity.requiresPathing,
				},
			);
			offset = {
				x: entity.radius % (1 / this.resolution),
				y: entity.radius % (1 / this.resolution),
			};
		}

		const tried = [];
		if (this.grid[yTile] && this.grid[yTile][xTile])
			tried.push(this.grid[yTile][xTile]);

		while (
			!this._pathable(minimalTilemap, xTile, yTile) ||
			(layer !== undefined && attemptLayer !== layer)
		) {
			if (!remainingTries--) return { x: originalX, y: originalY };

			switch (direction) {
				case DIRECTION.DOWN:
					yTile += stride;
					break;
				case DIRECTION.RIGHT:
					xTile += stride;
					break;
				case DIRECTION.UP:
					yTile -= stride;
					break;
				case DIRECTION.LEFT:
					xTile -= stride;
					break;
			}

			if (this.grid[yTile] && this.grid[yTile][xTile])
				tried.push(this.grid[yTile][xTile]);

			if (steps === 0) {
				steps = initialSteps;
				if (direction === 0 || direction === 2) initialSteps++;
				direction = (direction + 1) % 4;
			} else steps--;

			attemptLayer = this._layer(xTile, yTile);
		}

		return {
			x: this.xTileToWorld(xTile) + offset.x,
			y: this.yTileToWorld(yTile) + offset.y,
		};
	}

	worldToTile(world: Point): Tile {
		return this.grid[this.yWorldToTile(world.y)][
			this.xWorldToTile(world.x)
		];
	}

	xWorldToTile(x: number): number {
		return Math.floor(x * this.resolution);
	}

	yWorldToTile(y: number): number {
		return Math.floor(y * this.resolution);
	}

	xTileToWorld(x: number): number {
		return x / this.resolution;
	}

	yTileToWorld(y: number): number {
		return y / this.resolution;
	}

	pointToTilemap(
		xWorld: number,
		yWorld: number,
		radius = 0,
		{ type = PATHING_TYPES.WALKABLE, includeOutOfBounds = false } = {},
	): Footprint {
		radius -= EPSILON * radius * this.widthWorld;

		const xTile = this.xWorldToTile(xWorld);
		const yTile = this.yWorldToTile(yWorld);

		const map = [];

		const xMiss = xTile / this.resolution - xWorld;
		const yMiss = yTile / this.resolution - yWorld;

		const minX = Math.max(
			this.xWorldToTile(xWorld - radius) - xTile,
			includeOutOfBounds ? -Infinity : -xTile,
		);
		const maxX = Math.min(
			this.xWorldToTile(xWorld + radius) - xTile,
			includeOutOfBounds ? Infinity : this.widthMap - xTile - 1,
		);
		const minY = Math.max(
			this.yWorldToTile(yWorld - radius) - yTile,
			includeOutOfBounds ? -Infinity : -yTile,
		);
		const maxY = Math.min(
			this.yWorldToTile(yWorld + radius) - yTile,
			includeOutOfBounds ? Infinity : this.heightMap - yTile - 1,
		);

		const radiusSquared = radius ** 2;

		for (let tY = minY; tY <= maxY; tY++)
			for (let tX = minX; tX <= maxX; tX++) {
				const yDelta =
					tY < 0
						? (tY + 1) / this.resolution + yMiss
						: tY > 0
						? tY / this.resolution + yMiss
						: 0;
				const xDelta =
					tX < 0
						? (tX + 1) / this.resolution + xMiss
						: tX > 0
						? tX / this.resolution + xMiss
						: 0;

				if (xDelta ** 2 + yDelta ** 2 < radiusSquared) map.push(type);
				else map.push(0);
			}

		const footprint = {
			map,
			top: minY,
			left: minX,
			width: maxX - minX + 1,
			height: maxY - minY + 1,
		};

		return footprint;
	}

	yBoundTile(yIndex: number): number {
		return Math.max(Math.min(yIndex, this.heightMap - 1), 0);
	}

	xBoundTile(xIndex: number): number {
		return Math.max(Math.min(xIndex, this.widthMap - 1), 0);
	}

	// Adapted from https://github.com/bgrins/javascript-astar/blob/master/astar.js
	// towards Theta*
	// This gets really sad when a path is not possible
	path(entity: Entity, target: Point): Point[] {
		if (typeof entity.radius !== "number")
			throw new Error("Can only path find radial entities");

		const cache: Cache = {
			_linearPathable: memoize((...args) =>
				this._linearPathable(...args),
			),
			_pathable: memoize((...args) => this._pathable(...args)),
			pointToTilemap: memoize((...args) => this.pointToTilemap(...args)),
		};

		const removed = this.entities.has(entity);
		if (removed) this.removeEntity(entity);

		// We assume an entity shoved into the top left corner is good
		const pathing =
			entity.requiresPathing === undefined
				? entity.pathing
				: entity.requiresPathing;
		if (pathing === undefined) throw "entity has no pathing";
		const minimalTilemap = cache.pointToTilemap(
			entity.radius,
			entity.radius,
			entity.radius,
			{ type: pathing },
		);

		const offset = entity.radius % (1 / this.resolution);
		// We can assume start is pathable
		const startReal = {
			x: entity.position.x * this.resolution,
			y: entity.position.y * this.resolution,
		};

		const startTile = this.entityToTile(entity);
		// For target, if the exact spot is pathable, we aim towards that; otherwise the nearest spot
		const targetTile = this.entityToTile(entity, target);

		const targetPathable =
			targetTile &&
			targetTile.pathable(pathing) &&
			this.pathable(entity, target.x, target.y);
		const endTile = targetPathable
			? targetTile
			: (() => {
					const { x, y } = this.nearestPathing(
						target.x,
						target.y,
						entity,
					);
					return this.grid[
						Math.round((y - offset) * this.resolution)
					][Math.round((x - offset) * this.resolution)];
			  })();
		const endReal = targetPathable
			? { x: target.x * this.resolution, y: target.y * this.resolution }
			: endTile;

		// If we start and end on the same tile, just move between them
		if (startTile === endTile && this.pathable(entity)) {
			if (removed) this.addEntity(entity);
			return [
				{ x: entity.position.x, y: entity.position.y },
				{
					x: endReal.x / this.resolution,
					y: endReal.y / this.resolution,
				},
			];
		}

		// Estimated cost remaining
		const h = (a: Point, b: Point) =>
			Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

		const startHeap = new BinaryHeap(
			(node: Tile) => node.__startRealPlusEstimatedCost ?? 0,
		);
		const startTag = Math.random();
		let startBest = startTile;
		startHeap.push(startTile);
		startTile.__startTag = startTag;
		startTile.__startRealCostFromOrigin = h(startReal, startTile);
		startTile.__startEstimatedCostRemaining = h(startTile, endReal);
		startTile.__startRealPlusEstimatedCost =
			startTile.__startEstimatedCostRemaining +
			startTile.__startRealCostFromOrigin;
		startTile.__startVisited = false;
		startTile.__startClosed = false;
		startTile.__startParent = null;

		const endHeap = new BinaryHeap(
			(node: Tile) => node.__endRealPlusEstimatedCost ?? 0,
		);
		const endTag = Math.random();
		let endBest = endTile;
		endHeap.push(endTile);
		endTile.__endTag = endTag;
		endTile.__endRealCostFromOrigin = h(endReal, endTile);
		endTile.__endEstimatedCostRemaining = h(endTile, startReal);
		endTile.__endRealPlusEstimatedCost =
			endTile.__endEstimatedCostRemaining +
			endTile.__endRealCostFromOrigin;
		endTile.__endVisited = false;
		endTile.__endClosed = false;
		endTile.__endParent = null;

		let checksSinceBestChange = 0;
		while (startHeap.length) {
			// Degenerate case: target is close to start, but ~blocked off
			if (checksSinceBestChange++ > 2500) break;

			// Start to End
			const startCurrent = startHeap.pop();

			if (startCurrent === endTile) {
				startBest = endTile;
				break;
			} else if (startCurrent.__endTag === endTag) {
				startBest = endBest = startCurrent;
				break;
			}

			startCurrent.__startClosed = true;

			const startNeighbors = startCurrent.nodes;

			for (let i = 0, length = startNeighbors.length; i < length; i++) {
				const neighbor = startNeighbors[i];

				if (neighbor.__startTag !== startTag) {
					neighbor.__startTag = startTag;
					neighbor.__startEstimatedCostRemaining = 0;
					neighbor.__startRealPlusEstimatedCost = 0;
					neighbor.__startRealCostFromOrigin = 0;
					neighbor.__startVisited = false;
					neighbor.__startClosed = false;
					neighbor.__startParent = null;
				}

				const wasVisited = neighbor.__startVisited;

				if (!wasVisited)
					if (neighbor.__startClosed || !neighbor.pathable(pathing))
						continue;
					else if (
						!cache._pathable(minimalTilemap, neighbor.x, neighbor.y)
					) {
						neighbor.__startClosed = true;
						continue;
					}

				const gScore =
					(startCurrent.__startRealCostFromOrigin ?? 0) + 1;

				// Line of sight test (this is laggy)
				if (
					startCurrent.__startParent &&
					cache._linearPathable(
						entity,
						startCurrent.__startParent,
						neighbor,
					)
				) {
					const gScore =
						(startCurrent.__startParent.__startRealCostFromOrigin ??
							0) + h(startCurrent.__startParent, neighbor);
					// First visit or better score than previously known
					if (
						!neighbor.__startVisited ||
						gScore < (neighbor.__startRealCostFromOrigin ?? 0)
					) {
						neighbor.__startVisited = true;
						neighbor.__startParent = startCurrent.__startParent;
						neighbor.__startEstimatedCostRemaining =
							neighbor.__startEstimatedCostRemaining ||
							h(neighbor, endReal);
						neighbor.__startRealCostFromOrigin = gScore;
						neighbor.__startRealPlusEstimatedCost =
							neighbor.__startRealCostFromOrigin +
							neighbor.__startEstimatedCostRemaining;

						if (
							neighbor.__startEstimatedCostRemaining <
								(startBest.__startEstimatedCostRemaining ??
									0) ||
							(neighbor.__startEstimatedCostRemaining ===
								startBest.__startEstimatedCostRemaining &&
								neighbor.__startRealCostFromOrigin <
									(startBest.__startRealCostFromOrigin ?? 0))
						) {
							startBest = neighbor;
							checksSinceBestChange = 0;
						}

						if (!wasVisited) startHeap.push(neighbor);
						else {
							const index = startHeap.indexOf(neighbor);
							if (index >= 0) startHeap.sinkDown(index);
						}
					}

					// First visit or better score than previously known
				} else if (
					!neighbor.__startVisited ||
					gScore < (neighbor.__startRealCostFromOrigin ?? 0)
				) {
					neighbor.__startVisited = true;
					neighbor.__startParent = startCurrent;
					neighbor.__startEstimatedCostRemaining =
						neighbor.__startEstimatedCostRemaining ||
						h(neighbor, endReal);
					neighbor.__startRealCostFromOrigin = gScore;
					neighbor.__startRealPlusEstimatedCost =
						neighbor.__startRealCostFromOrigin +
						neighbor.__startEstimatedCostRemaining;

					if (
						neighbor.__startEstimatedCostRemaining <
							(startBest.__startEstimatedCostRemaining ?? 0) ||
						(neighbor.__startEstimatedCostRemaining ===
							startBest.__startEstimatedCostRemaining &&
							neighbor.__startRealCostFromOrigin <
								(startBest.__startRealCostFromOrigin ?? 0))
					) {
						startBest = neighbor;
						checksSinceBestChange = 0;
					}

					if (!wasVisited) startHeap.push(neighbor);
					else {
						const index = startHeap.indexOf(neighbor);
						if (index >= 0) startHeap.sinkDown(index);
					}
				}
			}

			// End to Start

			if (!endHeap.length) {
				const { x, y } = this.nearestPathing(
					target.x,
					target.y,
					entity,
					(tile) => tile.__endTag !== endTag,
				);
				const newEndtile = this.grid[
					Math.round((y - offset) * this.resolution)
				][Math.round((x - offset) * this.resolution)];

				endBest = newEndtile;
				endHeap.push(newEndtile);
				newEndtile.__endTag = endTag;
				newEndtile.__endRealCostFromOrigin = h(endReal, newEndtile);
				newEndtile.__endEstimatedCostRemaining = h(
					newEndtile,
					startReal,
				);
				newEndtile.__endRealPlusEstimatedCost =
					newEndtile.__endEstimatedCostRemaining +
					newEndtile.__endRealCostFromOrigin;
				newEndtile.__endVisited = false;
				newEndtile.__endClosed = false;
				newEndtile.__endParent = null;
			}

			const endCurrent = endHeap.pop();

			if (endCurrent === startTile) {
				endBest = startTile;
				break;
			} else if (endCurrent.__startTag === startTag) {
				startBest = endBest = endCurrent;
				break;
			}

			endCurrent.__endClosed = true;

			const endNeighbors = endCurrent.nodes;

			for (let i = 0, length = endNeighbors.length; i < length; i++) {
				const neighbor = endNeighbors[i];

				if (neighbor.__endTag !== endTag) {
					neighbor.__endTag = endTag;
					neighbor.__endEstimatedCostRemaining = 0;
					neighbor.__endRealPlusEstimatedCost = 0;
					neighbor.__endRealCostFromOrigin = 0;
					neighbor.__endVisited = false;
					neighbor.__endClosed = false;
					neighbor.__endParent = null;
				}

				const wasVisited = neighbor.__endVisited;

				if (!wasVisited)
					if (neighbor.__endClosed || !neighbor.pathable(pathing))
						continue;
					else if (
						!cache._pathable(minimalTilemap, neighbor.x, neighbor.y)
					) {
						neighbor.__endClosed = true;
						continue;
					}

				const gScore = (endCurrent.__endRealCostFromOrigin ?? 0) + 1;

				// Line of sight test (this is laggy, so disabled ATM)
				if (
					endCurrent.__endParent &&
					cache._linearPathable(
						entity,
						endCurrent.__endParent,
						neighbor,
					)
				) {
					const gScore =
						(endCurrent.__endParent.__endRealCostFromOrigin ?? 0) +
						h(endCurrent.__endParent, neighbor);
					// First visit or better score than previously known
					if (
						!neighbor.__endVisited ||
						gScore < (neighbor.__endRealCostFromOrigin ?? 0)
					) {
						neighbor.__endVisited = true;
						neighbor.__endParent = endCurrent.__endParent;
						neighbor.__endEstimatedCostRemaining =
							neighbor.__endEstimatedCostRemaining ||
							h(neighbor, startReal);
						neighbor.__endRealCostFromOrigin = gScore;
						neighbor.__endRealPlusEstimatedCost =
							neighbor.__endRealCostFromOrigin +
							neighbor.__endEstimatedCostRemaining;

						if (
							neighbor.__endEstimatedCostRemaining <
								(endBest.__endEstimatedCostRemaining ?? 0) ||
							(neighbor.__endEstimatedCostRemaining ===
								endBest.__endEstimatedCostRemaining &&
								neighbor.__endRealCostFromOrigin <
									(endBest.__endRealCostFromOrigin ?? 0))
						) {
							endBest = neighbor;
							checksSinceBestChange = 0;
						}

						if (!wasVisited) endHeap.push(neighbor);
						else {
							const index = endHeap.indexOf(neighbor);
							if (index >= 0) endHeap.sinkDown(index);
						}
					}

					// First visit or better score than previously known
				} else if (
					!neighbor.__endVisited ||
					gScore < (neighbor.__endRealCostFromOrigin ?? 0)
				) {
					neighbor.__endVisited = true;
					neighbor.__endParent = endCurrent;
					neighbor.__endEstimatedCostRemaining =
						neighbor.__endEstimatedCostRemaining ||
						h(neighbor, startReal);
					neighbor.__endRealCostFromOrigin = gScore;
					neighbor.__endRealPlusEstimatedCost =
						neighbor.__endRealCostFromOrigin +
						neighbor.__endEstimatedCostRemaining;

					if (
						neighbor.__endEstimatedCostRemaining <
							(endBest.__endEstimatedCostRemaining ?? 0) ||
						(neighbor.__endEstimatedCostRemaining ===
							endBest.__endEstimatedCostRemaining &&
							neighbor.__endRealCostFromOrigin <
								(endBest.__endRealCostFromOrigin ?? 0))
					) {
						endBest = neighbor;
						checksSinceBestChange = 0;
					}

					if (!wasVisited) endHeap.push(neighbor);
					else {
						const index = endHeap.indexOf(neighbor);
						if (index >= 0) endHeap.sinkDown(index);
					}
				}
			}
		}

		if (debugging) {
			elems.forEach((elem) => arena.removeChild(elem));
			elems.splice(0);
			const max = this.grid.reduce(
				(max, row) =>
					row.reduce(
						(max, cell) =>
							Math.max(
								max,
								cell.__startTag === startTag &&
									cell.__startVisited
									? cell.__startRealPlusEstimatedCost ?? 0
									: cell.__endTag === endTag &&
									  cell.__endVisited
									? cell.__endRealPlusEstimatedCost ?? 0
									: -Infinity,
							),
						max,
					),
				-Infinity,
			);
			const min = this.grid.reduce(
				(min, row) =>
					row.reduce(
						(min, cell) =>
							Math.min(
								min,
								cell.__startTag === startTag &&
									cell.__startVisited
									? cell.__startRealPlusEstimatedCost ?? 0
									: cell.__endTag === endTag &&
									  cell.__endVisited
									? cell.__endRealPlusEstimatedCost ?? 0
									: Infinity,
							),
						min,
					),
				Infinity,
			);
			const d = max - min;
			for (let y = 0; y < this.grid.length; y++)
				for (let x = 0; x < this.grid[y].length; x++)
					if (
						(this.grid[y][x].__startTag === startTag &&
							this.grid[y][x].__startVisited) ||
						(this.grid[y][x].__endTag === endTag &&
							this.grid[y][x].__endVisited)
					)
						placeTile(
							x,
							y,
							((this.grid[y][x].__startTag === startTag &&
							this.grid[y][x].__startVisited
								? this.grid[y][x]
										.__startRealPlusEstimatedCost ?? 0
								: this.grid[y][x].__endTag === endTag &&
								  this.grid[y][x].__endVisited
								? this.grid[y][x].__endRealPlusEstimatedCost ??
								  0
								: Infinity) -
								min) /
								d,
						);
		}

		const pathTiles = [];
		let startCurrent: Tile | null | undefined = startBest;
		while (startCurrent) {
			pathTiles.unshift(startCurrent);
			startCurrent = startCurrent.__startParent;
		}

		if (startBest === endBest) {
			let endCurrent = startBest.__endParent;
			while (endCurrent) {
				pathTiles.push(endCurrent);
				endCurrent = endCurrent.__endParent;
			}
		}

		this._smooth(entity, pathTiles, cache);

		const pathWorld = pathTiles.map((tile) => ({
			x: this.xTileToWorld(tile.x) + offset,
			y: this.yTileToWorld(tile.y) + offset,
		}));

		const last = pathTiles[pathTiles.length - 1];

		const beginning =
			pathWorld.length > 1 &&
			(pathWorld[0].x !== entity.position.x ||
				pathWorld[0].y !== entity.position.y)
				? this.linearPathable(entity, entity.position, pathWorld[1])
					? [{ x: entity.position.x, y: entity.position.y }]
					: [
							{ x: entity.position.x, y: entity.position.y },
							pathWorld[0],
					  ]
				: [pathWorld[0]];

		if (removed) this.addEntity(entity);

		const path =
			// We didn't reach the end; pick closest node
			last !== targetTile
				? [...beginning, ...pathWorld.slice(1)]
				: // We reached the end
				  [
						...beginning,
						...pathWorld.slice(1),
						...(pathWorld[pathWorld.length - 1].x !==
							endReal.x / this.resolution ||
						pathWorld[pathWorld.length - 1].y !==
							endReal.y / this.resolution
							? [
									{
										x: endReal.x / this.resolution,
										y: endReal.y / this.resolution,
									},
							  ]
							: []),
				  ];

		return path;
	}

	/**
	 * Rechecks a path to make sure it's still pathable. Can return false even
	 * if the path is still pathable.
	 * @param path The array of points that make up the path to be checked.
	 * @param entity The object of the path to be checked. Includes clearance
	 * (radius) and pathing type.
	 * @param amount How far along the path we should check at a minimum. We'll
	 * likely overcheck, since we just verify segments of the path.
	 * @param offset How far along that path we start checking at maximum.
	 */
	recheck(
		path: Point[],
		entity: Entity,
		amount = Infinity,
		offset = 0,
	): boolean {
		const removed = this.entities.has(entity);
		if (removed) this.removeEntity(entity);

		let cur = 0;
		let distanceSquared = 0;
		const offsetSquared = offset ** 2;
		const amountSqaured = offsetSquared + amount ** 2;
		let segmentLength =
			(path[1].x - path[0].x) ** 2 + (path[1].y - path[0].y) ** 2;

		// Skip parts of the path we aren't rechecking.
		while (
			distanceSquared + segmentLength < offsetSquared &&
			cur < path.length - 2
		) {
			distanceSquared += segmentLength;
			cur++;
			segmentLength =
				(path[cur + 1].x - path[cur].x) ** 2 +
				(path[cur + 1].y - path[cur].y) ** 2;
		}

		if (cur === path.length - 1)
			return this.pathable(entity, path[cur].x, path[cur].y);

		while (cur < path.length - 1 && distanceSquared < amountSqaured) {
			if (!this.linearPathable(entity, path[cur], path[cur + 1])) {
				if (removed) this.addEntity(entity);
				return false;
			}

			distanceSquared +=
				(path[cur + 1].x - path[cur].x) ** 2 +
				(path[cur + 1].y - path[cur].y) ** 2;
			cur++;
		}

		if (removed) this.addEntity(entity);
		return true;
	}

	_smooth(entity: Entity, path: Tile[], cache: Cache = this): void {
		for (let skip = path.length - 1; skip > 1; skip--)
			for (let index = 0; index < path.length - skip; index++)
				if (
					cache._linearPathable(
						entity,
						path[index],
						path[index + skip],
					)
				) {
					path.splice(index + 1, skip - 1);
					skip = path.length;
					break;
				}
	}

	_linearPathable(entity: Entity, startTile: Tile, endTile: Tile): boolean {
		const radiusOffset = entity.radius % (1 / this.resolution);
		return this.linearPathable(
			entity,
			offset(startTile.world, radiusOffset),
			offset(endTile.world, radiusOffset),
		);
	}

	entityToTileCoordsBounded(
		entity: Entity,
		position: Point = entity.position,
	): { x: number; y: number } {
		const nudge = EPSILON * entity.radius * this.widthWorld;
		return {
			x: this.xBoundTile(
				Math.round(position.x * this.resolution - nudge),
			),
			y: this.yBoundTile(
				Math.round(position.y * this.resolution - nudge),
			),
		};
	}

	// BAD?
	entityToTile(entity: Entity, position: Point = entity.position): Tile {
		const { x, y } = this.entityToTileCoordsBounded(entity, position);
		return this.grid[y][x];
	}

	linearPathable(
		entity: Entity,
		startWorld: Point,
		endWorld: Point,
	): boolean {
		// Restrictions + pull fields off entity
		if (typeof entity.radius !== "number")
			throw new Error("Can only path find radial entities");
		const radius =
			entity.radius * this.resolution -
			EPSILON * entity.radius * this.widthWorld * this.resolution;
		const pathing =
			entity.requiresPathing !== undefined
				? entity.requiresPathing
				: entity.pathing;
		if (pathing === undefined) throw "entity has no pathing";

		// Swap so we're going right
		[startWorld, endWorld] =
			startWorld.x <= endWorld.x
				? [startWorld, endWorld]
				: [endWorld, startWorld];

		{
			const startTile = this.worldToTile(startWorld);
			const endTile = this.worldToTile(endWorld);

			if (startTile === endTile) {
				const map =
					entity.requiresTilemap ||
					this.pointToTilemap(
						startWorld.x,
						startWorld.y,
						entity.radius,
						{
							type: pathing,
						},
					);

				return this.withoutEntity(entity, () =>
					this._pathable(map, startTile.x, startTile.y),
				);
			}
		}

		/** Floating point on tilemap (so world * resolution) */
		const startPoint = {
			x: startWorld.x * this.resolution,
			y: startWorld.y * this.resolution,
		};
		/** Floating point on tilemap (so world * resolution) */
		const endPoint = {
			x: endWorld.x * this.resolution,
			y: endWorld.y * this.resolution,
		};

		// Describe approach
		const angle = Math.atan2(
			endPoint.y - startPoint.y,
			endPoint.x - startPoint.x,
		);
		const tan = (endPoint.x - startPoint.x) / (endPoint.y - startPoint.y);
		const positiveSlope = endPoint.y > startPoint.y;

		// for looping
		const minY = positiveSlope
			? Math.floor(startPoint.y - radius)
			: Math.floor(endPoint.y - radius);
		const maxY = positiveSlope
			? Math.floor(endPoint.y + radius)
			: Math.floor(startPoint.y + radius);
		const yStart = positiveSlope ? minY : maxY;
		const yStep = positiveSlope ? 1 : -1;
		const ySteps = Math.abs(minY - maxY);

		// for clamping
		const minX = Math.floor(startPoint.x - radius);
		const maxX = Math.floor(endPoint.x + radius);

		const leftTangent = polarProject(
			startPoint,
			angle - Math.PI / 2,
			radius,
		);
		const rightTangent = polarProject(
			startPoint,
			angle + Math.PI / 2,
			radius,
		);
		const endLeftTangent = polarProject(
			endPoint,
			angle - Math.PI / 2,
			radius,
		);
		const endRightTangent = polarProject(
			endPoint,
			angle + Math.PI / 2,
			radius,
		);

		const startFloor = positiveSlope
			? Math.floor(startPoint.y - radius) + 1
			: Math.ceil(startPoint.y + radius) - 1;

		const rightGuide = {
			x: isFinite(tan)
				? rightTangent.x + (startFloor - rightTangent.y) * tan
				: rightTangent.x - radius,
			y: startFloor,
		};
		const leftGuide = {
			x: isFinite(tan)
				? leftTangent.x - (leftTangent.y - startFloor) * tan
				: leftTangent.x - radius,
			y: startFloor,
		};

		const guide = Math.max(rightGuide.x, leftGuide.x);
		const guideDistance = Math.abs(rightGuide.x - leftGuide.x);

		const absTan = Math.abs(tan);
		const totalShift = isFinite(absTan)
			? absTan + guideDistance
			: guideDistance;

		let xStartRaw = guide - totalShift;
		for (let y = 0; y <= ySteps; y++) {
			const xEndRaw =
				xStartRaw + (isFinite(absTan) ? totalShift : Infinity);

			const xStartTest = Math.floor(xStartRaw);
			const xEndTest = Math.floor(xEndRaw);

			// Imagine an entity going right:
			// 0110
			// 1111
			// 1111
			// 0110
			// We don't want to check the top-left or bottom-left tiles
			const xStartMin =
				xStartRaw < startPoint.x &&
				behind(
					leftTangent,
					rightTangent,
					xStartTest + 1,
					yStart + y * yStep,
				)
					? trueMinX(
							startPoint,
							radius,
							yStart + y * yStep,
							Math.max(xStartTest, minX),
					  )
					: -Infinity;

			// Similar to the above, but to the left of the end location
			const xEndMin =
				xStartRaw < endPoint.x &&
				infront(
					endLeftTangent,
					endRightTangent,
					xStartTest - 1,
					yStart + y * yStep,
				)
					? trueMinX(
							endPoint,
							radius,
							yStart + y * yStep,
							Math.max(xStartTest, minX),
					  )
					: -Infinity;

			const xStart = Math.max(xStartMin, xEndMin, xStartTest, minX);

			// Similar to the above, but to the right of the start location
			const xStartMax =
				xEndRaw > startPoint.x &&
				behind(
					leftTangent,
					rightTangent,
					xEndTest + 1,
					yStart + y * yStep,
				)
					? trueMaxX(
							startPoint,
							radius,
							yStart + y * yStep,
							Math.min(xEndTest, maxX),
					  )
					: Infinity;

			// Similar to the above, but to the right of the end location
			const xEndMax =
				xEndRaw > endPoint.x &&
				infront(
					endLeftTangent,
					endRightTangent,
					xEndTest - 1,
					yStart + y * yStep,
				)
					? trueMaxX(
							endPoint,
							radius,
							yStart + y * yStep,
							Math.min(xEndTest, maxX),
					  )
					: Infinity;

			const xEnd = Math.min(xStartMax, xEndMax, xEndTest, maxX);

			for (let x = xStart; x <= xEnd; x++)
				if (!this.grid[yStart + y * yStep]?.[x]?.pathable(pathing))
					return false;

			xStartRaw += isFinite(absTan) ? absTan : 0;
		}

		return true;
	}

	addEntity(entity: Entity): void {
		const tiles = [];
		const { map, top, left, width, height } =
			entity.blocksTilemap ||
			this.pointToTilemap(
				entity.position.x,
				entity.position.y,
				entity.radius,
				{
					type:
						entity.blocksPathing === undefined
							? entity.pathing
							: entity.blocksPathing,
				},
			);
		const tileX = this.xWorldToTile(entity.position.x);
		const tileY = this.yWorldToTile(entity.position.y);
		for (let y = top; y < top + height; y++)
			for (let x = left; x < left + width; x++) {
				tiles.push(this.grid[tileY + y][tileX + x]);
				this.grid[tileY + y][tileX + x].addEntity(
					entity,
					map[(y - top) * width + (x - left)],
				);
			}

		this.entities.set(entity, tiles);
	}

	updateEntity(entity: Entity): void {
		if (!this.entities.has(entity)) return;
		const oldTiles: Tile[] = this.entities.get(entity) || [];
		const newTiles: Tile[] = [];
		const { map, top, left, width, height } =
			entity.blocksTilemap ||
			this.pointToTilemap(
				entity.position.x,
				entity.position.y,
				entity.radius,
				{
					type:
						entity.blocksPathing === undefined
							? entity.pathing
							: entity.blocksPathing,
				},
			);
		const tileX = this.xWorldToTile(entity.position.x);
		const tileY = this.yWorldToTile(entity.position.y);
		for (let y = top; y < top + height; y++)
			for (let x = left; x < left + width; x++)
				newTiles.push(this.grid[tileY + y][tileX + x]);

		// Tiles that the entity no longer occupies
		oldTiles
			.filter((t) => !newTiles.includes(t))
			.forEach((tile) => tile.removeEntity(entity));

		newTiles.forEach((tile, index) => {
			// Tiles the entity continues to occupy
			if (oldTiles.includes(tile)) tile.updateEntity(entity, map[index]);
			// Tiles the entity now occupies
			else tile.addEntity(entity, map[index]);
		});

		this.entities.set(entity, newTiles);
	}

	removeEntity(entity: Entity): void {
		const tiles = this.entities.get(entity);
		if (tiles) tiles.forEach((tile) => tile.removeEntity(entity));
		this.entities.delete(entity);
	}

	paint(): void {
		const host =
			this._elem ||
			(this._elem = (() => {
				const elem = document.createElement("div");
				arena.appendChild(elem);

				return elem;
			})());

		emptyElement(host);
		const cellSize = 32 / this.resolution;

		for (let y = 0; y < this.heightMap; y++)
			for (let x = 0; x < this.widthMap; x++) {
				const cell = document.createElement("div");
				Object.assign(cell.style, {
					zIndex: 10,
					position: "absolute",
					top: `${y * cellSize}px`,
					left: `${x * cellSize}px`,
					width: `${cellSize}px`,
					height: `${cellSize}px`,
					background: `rgba(${
						this.grid[y][x].pathing & 1 ? 255 : 0
					}, 0, ${this.grid[y][x].pathing & 2 ? 255 : 0}, 0.4)`,
				});
				host.appendChild(cell);
			}
	}

	paintMap(map: Footprint, xTile: number, yTile: number): void {
		const host =
			this._elem ||
			(this._elem = (() => {
				const elem = document.createElement("div");
				arena.appendChild(elem);

				return elem;
			})());

		const cellSize = 32 / this.resolution;

		let i = 0;

		for (let y = yTile + map.top; y < yTile + map.height + map.top; y++)
			for (
				let x = xTile + map.left;
				x < xTile + map.width + map.left;
				x++, i++
			) {
				const cell = document.createElement("div");
				Object.assign(cell.style, {
					zIndex: 10,
					position: "absolute",
					top: `${y * cellSize}px`,
					left: `${x * cellSize}px`,
					width: `${cellSize}px`,
					height: `${cellSize}px`,
					background:
						this.grid[y] === undefined ||
						this.grid[y][x] === undefined ||
						this.grid[y][x].pathing & map.map[i]
							? "rgba(255,0,0,0.5)"
							: "rgba(0,255,0,0.5)",
				});
				cell.setAttribute("x", x.toString());
				cell.setAttribute("y", y.toString());
				cell.setAttribute("i", i.toString());
				cell.setAttribute(
					"grid",
					(this.grid[y] === undefined
						? "no-y"
						: this.grid[y][x] === undefined
						? "no-x"
						: this.grid[y][x].pathing
					).toString(),
				);
				cell.setAttribute("map", map.map[i].toString());
				host.appendChild(cell);
			}
	}
}
