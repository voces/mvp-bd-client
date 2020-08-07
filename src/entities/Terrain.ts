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
import { Group, Geometry, Vector3 } from "three";
import { orientation } from "../pathing/math";

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

type TVector = TerrainMesh["vertices"][number][number][number];

export class Terrain {
	private group: Group;
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
		this.group = mesh;
	}

	private lastGroundHeight?: {
		x: number;
		y: number;
		height: number;
	};
	groundHeight(x: number, y: number): number {
		if (this.lastGroundHeight)
			if (this.lastGroundHeight.x === x && this.lastGroundHeight.y === y)
				return this.lastGroundHeight.height;

		const pt = { x, y };
		let triangle: [Vector3, Vector3, Vector3];
		const terrain = SceneObjectComponent.get(this)!.object as TerrainMesh;
		const geometry = terrain.ground.geometry as Geometry;
		const faces = terrain.groundFaces[Math.floor(y)]?.[Math.floor(x)];
		if (!faces) return 0;

		{
			const v1 = geometry.vertices[faces[0].a];
			const v2 = geometry.vertices[faces[0].b];
			const v3 = geometry.vertices[faces[0].c];

			const side1 = Math.abs(orientation(pt, v1, v2)) < 1e-7;
			const side2 = Math.abs(orientation(pt, v2, v3)) < 1e-7;
			const side3 = Math.abs(orientation(pt, v3, v1)) < 1e-7;

			triangle =
				side1 === side2 && side2 === side3
					? [v1, v2, v3]
					: [
							geometry.vertices[faces[1].a],
							geometry.vertices[faces[1].b],
							geometry.vertices[faces[1].c],
					  ];
		}

		let height: number;

		if (triangle[0].x !== triangle[1].x)
			// h1 = z + diff.z * percent.x
			height =
				triangle[0].z -
				((triangle[0].z - triangle[1].z) * (x - triangle[0].x)) /
					(triangle[1].x - triangle[0].x);
		else
			height =
				triangle[0].z -
				((triangle[0].z - triangle[2].z) * (x - triangle[0].x)) /
					(triangle[2].x - triangle[0].x);

		if (triangle[0].y !== triangle[1].y)
			// h1 = z + diff.z * percent.x
			height +=
				triangle[0].z -
				((triangle[0].z - triangle[1].z) * (y - triangle[0].y)) /
					(triangle[1].y - triangle[0].y);
		else
			height +=
				triangle[0].z -
				((triangle[0].z - triangle[2].z) * (y - triangle[0].y)) /
					(triangle[2].y - triangle[0].y);

		height = height / 2;

		this.lastGroundHeight = { x, y, height };

		// console.log(this.lastGroundHeight);

		return height;
	}
}
