import {
	Terrain as TerrainMesh,
	LordaeronSummerDarkGrass,
	LordaeronSummerRock,
	LordaeronSummerGrass,
	LordaeronSummerDirt,
	LordaeronSummerDirtCliff,
} from "notextures";
import { SceneObjectComponent } from "../components/graphics/SceneObjectComponent";
import { Arena } from "../arenas/types";

const isRamp = (x: number, y: number, layers: number[][]) => {
	const cur = layers[y]?.[x];
	if (cur === undefined) return false;

	const checks = [
		layers[y - 1]?.[x] - cur,
		layers[y + 1]?.[x] - cur,
		layers[y]?.[x + 1] - cur,
		layers[y]?.[x - 1] - cur,
	];

	if (checks.every((v) => v === 0)) return false;
	if (checks.some((v) => v > 1)) return false;
	if (!checks.some((v) => v === 1)) return false;

	return true;
};

export class Terrain {
	constructor(arena: Arena) {
		const tileZeroes = arena.layers.map((r) => r.map(() => 0));
		const vertexZeroes = Array(arena.layers[0].length + 1).fill(
			new Array(arena.layers.length + 1),
		);
		const mesh = new TerrainMesh({
			masks: {
				height: vertexZeroes,
				cliff: arena.layers.map((r, y) =>
					r.map((v, x) => {
						if (isRamp(x, y, arena.layers)) return "r";
						if (v > 1) return 2;
						return v;
					}),
				),
				groundTile: arena.pathing,
				cliffTile: arena.layers.map((r) => r.map(() => 4)),
				water: tileZeroes,
				waterHeight: vertexZeroes,
			},
			offset: {
				x: 0,
				y: arena.layers.length - 2,
				z: 0,
			},
			tiles: [
				LordaeronSummerDarkGrass,
				LordaeronSummerGrass,
				LordaeronSummerRock,
				LordaeronSummerDirt,
				LordaeronSummerDirtCliff,
			],
			size: {
				width: arena.layers[0].length,
				height: arena.layers.length,
			},
		});
		new SceneObjectComponent(this, mesh);
	}
}
