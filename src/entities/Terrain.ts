import { Terrain as TerrainMesh } from "notextures";
import { SceneObjectComponent } from "../components/graphics/SceneObjectComponent";
import { Arena } from "../arenas/types";

export class Terrain {
	constructor(arena: Arena) {
		const tileZeroes = arena.pathing.map((r) => r.map(() => 0));
		const vertexZeroes = Array(arena.pathing[0].length + 1).fill(
			new Array(arena.pathing.length + 1),
		);
		new SceneObjectComponent(
			this,
			new TerrainMesh({
				masks: {
					height: vertexZeroes,
					cliff: tileZeroes,
					groundTile: tileZeroes,
					cliffTile: tileZeroes,
					water: tileZeroes,
					waterHeight: vertexZeroes,
				},
				offset: { x: 0, y: 0, z: 0 },
				tiles: [
					{ color: "#008000" },
					{ color: "#555555" },
					{ color: "#569656" },
				],
				size: {
					width: arena.pathing[0].length,
					height: arena.pathing.length,
				},
			}),
		);
	}
}
