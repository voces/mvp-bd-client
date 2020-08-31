import { theDump } from "./theDump";
import { theFarm } from "./theFarm";
import { theGap } from "./theGap";
import { theRock } from "./theRock";
import { theTamedWoods } from "./theTamedWoods";
import { theTarget } from "./theTarget";
import { theTinyRectangle } from "./theTinyRectangle";
import { theWoods } from "./theWoods";

import { PATHING_TYPES } from "../pathing/constants";
import { Arena, InternalArena } from "./types";

const UNPATHABLE = PATHING_TYPES.WALKABLE + PATHING_TYPES.BUILDABLE;

const getHeight = (arena: InternalArena) => arena.cliffs.length;
const getWidth = (arena: InternalArena) =>
	Math.max(
		...arena.cliffs.map((l) => l.length),
		...arena.tiles.map((t) => t.length),
	);

const _asMaxNum = (v: number | "r") => (typeof v === "number" ? v : -Infinity);
const cliffHeight = (cliffs: (number | "r")[][], x: number, y: number) => {
	const v = cliffs[y][x];
	if (typeof v === "number") return v;
	return Math.max(
		_asMaxNum(cliffs[y][x - 1]),
		_asMaxNum(cliffs[y][x + 1]),
		_asMaxNum(cliffs[y - 1][x]),
		_asMaxNum(cliffs[y + 1][x]),
	);
};
const getPathingCliffs = (cliffs: (number | "r")[][]): number[][] =>
	cliffs.map((row, y) => row.map((_, x) => cliffHeight(cliffs, x, y)));

const neighbors = [
	{ x: -1, y: -1 },
	{ x: 0, y: -1 },
	{ x: 1, y: -1 },
	{ x: -1, y: 0 },
	{ x: 1, y: 0 },
	{ x: -1, y: 1 },
	{ x: 0, y: 1 },
	{ x: 1, y: 1 },
];

const processArena = (arena: InternalArena): Arena => {
	const height = getHeight(arena);
	const width = getWidth(arena);

	const cliffs = arena.cliffs.map((row) => row.map((v) => v ?? 0));

	const pathing = Array(height)
		.fill(0)
		.map((_, y) =>
			Array(width)
				.fill(0)
				.map((_, x) => {
					const cur = cliffs[y][x];
					// Ramps are pathable
					if (cur === "r") return 0;

					let rampNeighbors = 0;
					let cliffChange = false;

					// Cliff changes are not pathable
					for (const neighbor of neighbors) {
						const tile = cliffs[y + neighbor.y]?.[x + neighbor.x];
						if (tile === "r") rampNeighbors++;
						else if (tile !== cur) cliffChange = true;
					}

					if (rampNeighbors <= 1 && cliffChange) return UNPATHABLE;

					// Tiles 1 and 2 are unbuildable
					if (arena.tiles[y][x] === 1 || arena.tiles[y][x] === 2)
						return PATHING_TYPES.BUILDABLE;

					// Otherwise it is pathable
					return 0;
				}),
		);

	return {
		cliffs,
		height,
		name: arena.name,
		pathing,
		tiles: arena.tiles,
		width,
		pathingCliffs: getPathingCliffs(cliffs),
	};

	// return Object.assign(arena, {
	// 	cliffs: arena.cliffs.map((row) => row.map((v) => v ?? 0)),
	// 	pathing,
	// 	width,
	// 	height,
	// 	pathingCliffs: arena.cliffs.map((row) => row.map((v) => )),
	// });
};

export const arenas = [
	// theDump,
	theFarm,
	// theGap,
	// theRock,
	// theTamedWoods,
	// theTarget,
	// theTinyRectangle,
	// theWoods,
].map(processArena);
