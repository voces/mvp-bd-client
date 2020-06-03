import PathingMap from "./PathingMap.js";
import { PATHING_TYPES } from "../constants.js";
import array2 from "../../test/array2.js";

const pathing = [
	[0, 1],
	[2, 3],
];

const gridToPathing = (grid: typeof PathingMap.prototype.grid) =>
	grid.map((row) => row.map((tile) => tile.pathing));

const expectGrid = (pathingMap: PathingMap, grid: number[][]) =>
	expect(gridToPathing(pathingMap.grid)).toEqual(grid);

describe("PathingMap#constructor", () => {
	it("pathing=[...], resolution=default", () => {
		const pathingMap = new PathingMap({ pathing });

		expectGrid(pathingMap, [
			[0, 1],
			[2, 3],
		]);

		expect(pathingMap.resolution).toEqual(1);
		expect(pathingMap.heightWorld).toEqual(2);
		expect(pathingMap.widthWorld).toEqual(2);
		expect(pathingMap.heightMap).toEqual(2);
		expect(pathingMap.widthMap).toEqual(2);
	});

	it("pathing=[...], resolution=1", () => {
		const pathingMap = new PathingMap({ pathing });

		expectGrid(pathingMap, [
			[0, 1],
			[2, 3],
		]);

		expect(pathingMap.resolution).toEqual(1);
		expect(pathingMap.heightWorld).toEqual(2);
		expect(pathingMap.widthWorld).toEqual(2);
		expect(pathingMap.heightMap).toEqual(2);
		expect(pathingMap.widthMap).toEqual(2);
	});

	it("pathing=[...], resolution=2", () => {
		const pathingMap = new PathingMap({ pathing, resolution: 2 });

		expectGrid(pathingMap, [
			[0, 0, 1, 1],
			[0, 0, 1, 1],
			[2, 2, 3, 3],
			[2, 2, 3, 3],
		]);

		expect(pathingMap.resolution).toEqual(2);
		expect(pathingMap.heightWorld).toEqual(2);
		expect(pathingMap.widthWorld).toEqual(2);
		expect(pathingMap.heightMap).toEqual(4);
		expect(pathingMap.widthMap).toEqual(4);
	});

	it("pathing=[...], resolution=3", () => {
		const pathingMap = new PathingMap({ pathing, resolution: 3 });

		expectGrid(pathingMap, [
			[0, 0, 0, 1, 1, 1],
			[0, 0, 0, 1, 1, 1],
			[0, 0, 0, 1, 1, 1],
			[2, 2, 2, 3, 3, 3],
			[2, 2, 2, 3, 3, 3],
			[2, 2, 2, 3, 3, 3],
		]);

		expect(pathingMap.resolution).toEqual(3);
		expect(pathingMap.heightWorld).toEqual(2);
		expect(pathingMap.widthWorld).toEqual(2);
		expect(pathingMap.heightMap).toEqual(6);
		expect(pathingMap.widthMap).toEqual(6);
	});
});

describe("PathingMap#xWorldToTile", () => {
	it("with resolution=1", () => {
		const pathingMap = new PathingMap({ pathing });

		expect(pathingMap.xWorldToTile(0.5)).toEqual(0);
		expect(pathingMap.xWorldToTile(1.5)).toEqual(1);
	});

	it("with resolution=2", () => {
		const pathingMap = new PathingMap({ pathing, resolution: 2 });

		expect(pathingMap.xWorldToTile(0.25)).toEqual(0);
		expect(pathingMap.xWorldToTile(0.75)).toEqual(1);
		expect(pathingMap.xWorldToTile(1.25)).toEqual(2);
		expect(pathingMap.xWorldToTile(1.75)).toEqual(3);
	});
});

describe("PathingMap#yWorldToTile", () => {
	it("with resolution=1", () => {
		const pathingMap = new PathingMap({ pathing });

		expect(pathingMap.yWorldToTile(0.5)).toEqual(0);
		expect(pathingMap.yWorldToTile(1.5)).toEqual(1);
	});

	it("with resolution=2", () => {
		const pathingMap = new PathingMap({ pathing, resolution: 2 });

		expect(pathingMap.yWorldToTile(0.25)).toEqual(0);
		expect(pathingMap.yWorldToTile(0.75)).toEqual(1);
		expect(pathingMap.yWorldToTile(1.25)).toEqual(2);
		expect(pathingMap.yWorldToTile(1.75)).toEqual(3);
	});
});

describe("PathingMap#xTileToWorld", () => {
	it("with resolution=1", () => {
		const pathingMap = new PathingMap({ pathing });

		expect(pathingMap.xTileToWorld(0)).toEqual(0);
		expect(pathingMap.xTileToWorld(1)).toEqual(1);
	});

	it("with resolution=2", () => {
		const pathingMap = new PathingMap({ pathing, resolution: 2 });

		expect(pathingMap.xTileToWorld(0)).toEqual(0);
		expect(pathingMap.xTileToWorld(1)).toEqual(0.5);
		expect(pathingMap.xTileToWorld(2)).toEqual(1);
		expect(pathingMap.xTileToWorld(3)).toEqual(1.5);
	});
});

describe("PathingMap#yTileToWorld", () => {
	it("with resolution=1", () => {
		const pathingMap = new PathingMap({ pathing });

		expect(pathingMap.yTileToWorld(0)).toEqual(0);
		expect(pathingMap.yTileToWorld(1)).toEqual(1);
	});

	it("with resolution=2", () => {
		const pathingMap = new PathingMap({ pathing, resolution: 2 });

		expect(pathingMap.yTileToWorld(0)).toEqual(0);
		expect(pathingMap.yTileToWorld(1)).toEqual(0.5);
		expect(pathingMap.yTileToWorld(2)).toEqual(1);
		expect(pathingMap.yTileToWorld(3)).toEqual(1.5);
	});
});

describe("PathingMap#pointToTilemap", () => {
	const pathingMap = new PathingMap({ pathing, resolution: 4 });

	it("top-left corner (0.25)", () => {
		expect(pathingMap.pointToTilemap(0.25, 0.25, 0.25)).toEqual({
			map: Array(4).fill(PATHING_TYPES.WALKABLE),
			top: -1,
			left: -1,
			width: 2,
			height: 2,
		});
	});

	it("top-left corner (0.5)", () => {
		expect(pathingMap.pointToTilemap(0.5, 0.5, 0.5)).toEqual({
			map: Array(16).fill(PATHING_TYPES.WALKABLE),
			top: -2,
			left: -2,
			width: 4,
			height: 4,
		});
	});

	it("top-left corner (1)", () => {
		expect(pathingMap.pointToTilemap(1, 1, 1)).toEqual({
			map: [
				0,
				1,
				1,
				1,
				1,
				1,
				1,
				0,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				0,
				1,
				1,
				1,
				1,
				1,
				1,
				0,
			],
			top: -4,
			left: -4,
			width: 8,
			height: 8,
		});
	});

	it("offset (right-down)", () => {
		expect(pathingMap.pointToTilemap(1.01, 1.01, 0.5)).toEqual({
			map: [
				1,
				1,
				1,
				1,
				0,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				0,
				0,
				1,
				1,
				0,
				0,
			],
			top: -2,
			left: -2,
			width: 5,
			height: 5,
		});
	});

	it("offset (left-up)", () => {
		expect(pathingMap.pointToTilemap(0.99, 0.99, 0.5)).toEqual({
			map: [
				0,
				0,
				1,
				1,
				0,
				0,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				1,
				0,
				1,
				1,
				1,
				1,
			],
			top: -2,
			left: -2,
			width: 5,
			height: 5,
		});
	});
});

describe("adding, removing, and updating entities", () => {
	const pathing: number[][] = Array(8)
		.fill(0)
		.map(() => Array(8).fill(0));

	describe("Pathing#addEntity", () => {
		it("works", () => {
			const pathingMap = new PathingMap({ pathing });

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);

			const entity = {
				radius: 2,
				x: 3.1,
				y: 3.9,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entity);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);
		});

		it("handles stacking", () => {
			const pathingMap = new PathingMap({ pathing });

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);

			const entityA = {
				radius: 2,
				x: 3.1,
				y: 3.9,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entityA);
			const entityB = {
				radius: 2,
				x: 4.1,
				y: 4.9,
				pathing: PATHING_TYPES.BUILDABLE,
			};
			pathingMap.addEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0, 0, 0],
				[0, 1, 1, 3, 3, 0, 0, 0],
				[0, 1, 3, 3, 3, 3, 0, 0],
				[0, 1, 3, 3, 3, 3, 2, 0],
				[0, 1, 3, 3, 3, 2, 2, 0],
				[0, 0, 2, 2, 2, 2, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);
		});
	});

	describe("Pathing#removeEntity", () => {
		it("works", () => {
			const pathingMap = new PathingMap({ pathing });
			const entity = {
				radius: 2,
				x: 3.1,
				y: 3.9,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entity);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);

			pathingMap.removeEntity(entity);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);
		});

		it("handles stacking", () => {
			const pathingMap = new PathingMap({ pathing });
			const entityA = {
				radius: 2,
				x: 3.1,
				y: 3.9,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entityA);
			const entityB = {
				radius: 2,
				x: 4.1,
				y: 4.9,
				pathing: PATHING_TYPES.BUILDABLE,
			};
			pathingMap.addEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0, 0, 0],
				[0, 1, 1, 3, 3, 0, 0, 0],
				[0, 1, 3, 3, 3, 3, 0, 0],
				[0, 1, 3, 3, 3, 3, 2, 0],
				[0, 1, 3, 3, 3, 2, 2, 0],
				[0, 0, 2, 2, 2, 2, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);

			pathingMap.removeEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);
		});
	});

	describe("Pathing#updateEntity", () => {
		it("works", () => {
			const pathingMap = new PathingMap({ pathing });
			const entity = {
				radius: 2,
				x: 3.1,
				y: 3.9,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entity);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 1, 0, 0],
				[0, 1, 1, 1, 1, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);

			Object.assign(entity, {
				x: 4.1,
				y: 4.9,
				pathing: PATHING_TYPES.WALKABLE,
			});
			pathingMap.updateEntity(entity);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 1, 1, 0, 0, 0],
				[0, 0, 1, 1, 1, 1, 0, 0],
				[0, 0, 1, 1, 1, 1, 1, 0],
				[0, 0, 1, 1, 1, 1, 1, 0],
				[0, 0, 1, 1, 1, 1, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);
		});

		it("handles stacking", () => {
			const pathingMap = new PathingMap({ pathing });
			const entityA = {
				radius: 2,
				x: 3.1,
				y: 3.9,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entityA);
			const entityB = {
				radius: 2,
				x: 4.1,
				y: 4.9,
				pathing: PATHING_TYPES.BUILDABLE,
			};
			pathingMap.addEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0, 0, 0],
				[0, 1, 1, 3, 3, 0, 0, 0],
				[0, 1, 3, 3, 3, 3, 0, 0],
				[0, 1, 3, 3, 3, 3, 2, 0],
				[0, 1, 3, 3, 3, 2, 2, 0],
				[0, 0, 2, 2, 2, 2, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);

			Object.assign(entityB, { x: 4.1, y: 3.9 });
			pathingMap.updateEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 3, 2, 0, 0, 0],
				[0, 1, 3, 3, 3, 2, 0, 0],
				[0, 1, 3, 3, 3, 3, 2, 0],
				[0, 1, 3, 3, 3, 3, 2, 0],
				[0, 1, 3, 3, 3, 2, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0],
			]);
		});
	});
});

describe("Pathing#pathable", () => {
	const pathing: number[][] = Array(8)
		.fill(0)
		.map(() => Array(8).fill(PATHING_TYPES.BUILDABLE));

	it("walk on nonbuildable", () => {
		const pathingMap = new PathingMap({ pathing });
		const entity = {
			x: 1,
			y: 1,
			radius: 1,
			pathing: PATHING_TYPES.WALKABLE,
		};

		expect(pathingMap.pathable(entity)).toBeTruthy();
	});

	it("can't stack", () => {
		const pathingMap = new PathingMap({ pathing });
		const entityA = {
			x: 1,
			y: 1,
			radius: 1,
			pathing: PATHING_TYPES.WALKABLE,
		};
		const entityB = {
			x: 1.5,
			y: 1.5,
			radius: 1,
			pathing: PATHING_TYPES.WALKABLE,
		};
		pathingMap.addEntity(entityA);

		expect(pathingMap.pathable(entityB)).toBeFalsy();
	});

	it("can place near", () => {
		const pathingMap = new PathingMap({ pathing });
		const entityA = {
			x: 1,
			y: 1,
			radius: 1,
			pathing: PATHING_TYPES.WALKABLE,
		};
		const entityB = {
			x: 3,
			y: 1,
			radius: 1,
			pathing: PATHING_TYPES.WALKABLE,
		};
		pathingMap.addEntity(entityA);

		expect(pathingMap.pathable(entityB)).toBeTruthy();
	});
});

describe("PathingMap#nearestSpiralPathing", () => {
	describe("radius=0.5", () => {
		const pathing: number[][] = Array(3)
			.fill(0)
			.map(() => Array(3).fill(0));
		const setup = ({
			x,
			y,
			pathing: passedPathing,
		}: {
			x: number;
			y: number;
			pathing?: number[][];
		}) => {
			const pathingMap = new PathingMap({
				pathing: passedPathing || pathing,
			});
			pathingMap.addEntity({
				radius: 0.5,
				x: 1.5,
				y: 1.5,
				pathing: PATHING_TYPES.WALKABLE | PATHING_TYPES.BUILDABLE,
			});
			const entity = {
				radius: 0.5,
				x: 1,
				y: 1,
				pathing: PATHING_TYPES.WALKABLE,
			};
			const nearest = pathingMap.nearestSpiralPathing(x, y, entity);
			Object.assign(entity, nearest);

			return { pathingMap, nearest, entity };
		};

		it("slight up", () => {
			const { pathingMap, nearest, entity } = setup({ x: 1.5, y: 1.25 });

			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 0],
				[0, 0, 0],
			]);
			expect(nearest).toEqual({ x: 1.5, y: 0.5 });

			pathingMap.addEntity(entity);

			expectGrid(pathingMap, [
				[0, 1, 0],
				[0, 3, 0],
				[0, 0, 0],
			]);
		});

		it("slight down", () => {
			const { pathingMap, nearest, entity } = setup({ x: 1.5, y: 1.75 });
			pathingMap.addEntity(entity);

			expect(nearest).toEqual({ x: 1.5, y: 2.5 });
			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 0],
				[0, 1, 0],
			]);
		});

		it("slight left", () => {
			const { pathingMap, nearest, entity } = setup({ x: 1.25, y: 1.5 });
			pathingMap.addEntity(entity);

			expect(nearest).toEqual({ x: 0.5, y: 1.5 });
			expectGrid(pathingMap, [
				[0, 0, 0],
				[1, 3, 0],
				[0, 0, 0],
			]);
		});

		it("slight right", () => {
			const { pathingMap, nearest, entity } = setup({ x: 1.75, y: 1.5 });
			pathingMap.addEntity(entity);

			expect(nearest).toEqual({ x: 2.5, y: 1.5 });
			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 1],
				[0, 0, 0],
			]);
		});
	});

	// These are essentially "farms" that are 2x2, all spirals go up
	describe("radius=1", () => {
		const pathing = Array(6)
			.fill(0)
			.map(() => Array(6).fill(0));
		const setup = ({
			x,
			y,
			pathing: passedPathing,
		}: {
			x: number;
			y: number;
			pathing?: number[][];
		}) => {
			const pathingMap = new PathingMap({
				pathing: passedPathing || pathing,
			});
			pathingMap.addEntity({
				radius: 1,
				x: 3,
				y: 3,
				pathing: PATHING_TYPES.WALKABLE | PATHING_TYPES.BUILDABLE,
			});
			const entity = {
				radius: 1,
				x: 1,
				y: 1,
				pathing: PATHING_TYPES.WALKABLE,
			};
			const nearest = pathingMap.nearestSpiralPathing(x, y, entity);
			Object.assign(entity, nearest);

			return { pathingMap, nearest, entity };
		};

		it("off edge", () => {
			const { pathingMap, nearest, entity } = setup({ x: 0.75, y: 0.75 });

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
			]);
			expect(nearest).toEqual({ x: 1, y: 1 });

			pathingMap.addEntity(entity);

			expectGrid(pathingMap, [
				[1, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
			]);
		});

		it("greatly off edge", () => {
			const { pathingMap, nearest, entity } = setup({ x: -1, y: -1 });
			pathingMap.addEntity(entity);

			expect(nearest).toEqual({ x: 1, y: 1 });
			expectGrid(pathingMap, [
				[1, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
			]);
		});

		it("on top", () => {
			const { pathingMap, nearest, entity } = setup({ x: 3, y: 3 });
			pathingMap.addEntity(entity);

			expect(nearest).toEqual({ x: 2, y: 5 });
			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 1, 1, 0, 0, 0],
				[0, 1, 1, 0, 0, 0],
			]);
		});

		it("slightly above", () => {
			const pathingMap = new PathingMap({ pathing });
			const entityA = {
				radius: 1,
				x: 3,
				y: 3,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entityA);
			const entityB = {
				radius: 1,
				x: 0,
				y: 0,
				pathing: PATHING_TYPES.WALKABLE,
			};
			const nearest = pathingMap.nearestSpiralPathing(3, 2, entityB);

			expect(nearest).toEqual({ x: 4, y: 1 });

			Object.assign(entityB, nearest);
			pathingMap.addEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 1, 1, 0],
				[0, 0, 0, 1, 1, 0],
				[0, 0, 1, 1, 0, 0],
				[0, 0, 1, 1, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
			]);
		});

		it("slightly below", () => {
			const pathingMap = new PathingMap({ pathing });
			const entityA = {
				radius: 1,
				x: 3,
				y: 3,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entityA);
			const entityB = {
				radius: 1,
				x: 0,
				y: 0,
				pathing: PATHING_TYPES.WALKABLE,
			};
			const nearest = pathingMap.nearestSpiralPathing(3, 4, entityB);

			expect(nearest).toEqual({ x: 3, y: 5 });

			Object.assign(entityB, nearest);
			pathingMap.addEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0],
				[0, 0, 1, 1, 0, 0],
				[0, 0, 1, 1, 0, 0],
				[0, 0, 1, 1, 0, 0],
			]);
		});

		it("slightly right", () => {
			const pathingMap = new PathingMap({ pathing });
			const entityA = {
				radius: 1,
				x: 3,
				y: 3,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entityA);
			const entityB = {
				radius: 1,
				x: 0,
				y: 0,
				pathing: PATHING_TYPES.WALKABLE,
			};
			const nearest = pathingMap.nearestSpiralPathing(4, 3, entityB);

			expect(nearest).toEqual({ x: 5, y: 4 });

			Object.assign(entityB, nearest);
			pathingMap.addEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 1, 1, 0, 0],
				[0, 0, 1, 1, 1, 1],
				[0, 0, 0, 0, 1, 1],
				[0, 0, 0, 0, 0, 0],
			]);
		});

		it("slightly left", () => {
			const pathingMap = new PathingMap({ pathing });
			const entityA = {
				radius: 1,
				x: 3,
				y: 3,
				pathing: PATHING_TYPES.WALKABLE,
			};
			pathingMap.addEntity(entityA);
			const entityB = {
				radius: 1,
				x: 0,
				y: 0,
				pathing: PATHING_TYPES.WALKABLE,
			};
			const nearest = pathingMap.nearestSpiralPathing(2, 3, entityB);

			expect(nearest).toEqual({ x: 1, y: 2 });

			Object.assign(entityB, nearest);
			pathingMap.addEntity(entityB);

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0],
				[1, 1, 1, 1, 0, 0],
				[0, 0, 1, 1, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
			]);
		});
	});
});

describe("PathingMap#_linearPathable", () => {
	describe("radius=0.5", () => {
		describe("open", () => {
			const pathing = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			];
			for (let x1 = 0; x1 < 3; x1++)
				for (let x2 = 0; x2 < 3; x2++)
					for (let y1 = 0; y1 < 3; y1++)
						for (let y2 = 0; y2 < 3; y2++) {
							const dx = Math.abs(x2 - x1);
							const dy = Math.abs(y2 - y1);

							if (dx === 0 && dy === 0) continue;

							const pathingMap = new PathingMap({ pathing });
							const entity = {
								radius: 0.5,
								pathing: 1,
								x: 0,
								y: 0,
							};
							const start = { x: x1, y: y1 };
							const end = { x: x2, y: y2 };

							it(`start=${JSON.stringify(
								start,
							)}, end=${JSON.stringify(end)}`, () => {
								expect(
									pathingMap._linearPathable(
										entity,
										start,
										end,
									),
								).toBeTruthy();
							});
						}
		});

		describe("blocked", () => {
			const pathing = [
				[0, 0, 0],
				[0, 3, 0],
				[0, 0, 0],
			];
			for (let x1 = 0; x1 < 3; x1++)
				for (let x2 = 0; x2 < 3; x2++)
					for (let y1 = 0; y1 < 3; y1++)
						for (let y2 = 0; y2 < 3; y2++) {
							const dx = Math.abs(x2 - x1);
							const dy = Math.abs(y2 - y1);

							if (dx === 0 && dy === 0) continue;

							const pathingMap = new PathingMap({ pathing });
							const entity = {
								radius: 0.5,
								pathing: 1,
								x: 0,
								y: 0,
							};
							const start = { x: x1, y: y1 };
							const end = { x: x2, y: y2 };

							it(`start=${JSON.stringify(
								start,
							)}, end=${JSON.stringify(end)}`, () => {
								expect(
									pathingMap._linearPathable(
										entity,
										start,
										end,
									),
								).toEqual(
									(dx !== 0 && dy !== 0) ||
										(dx && y1 === 1) ||
										(dy && x1 === 1)
										? false
										: true,
								);
							});
						}
		});
	});

	describe("radius=1", () => {
		describe("open", () => {
			const pathing = [
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
			];
			for (let x1 = 1; x1 < 6; x1++)
				for (let x2 = 1; x2 < 6; x2++)
					for (let y1 = 1; y1 < 6; y1++)
						for (let y2 = 1; y2 < 6; y2++) {
							const dx = Math.abs(x2 - x1);
							const dy = Math.abs(y2 - y1);

							if (dx === 0 && dy === 0) continue;

							const pathingMap = new PathingMap({ pathing });
							const entity = {
								radius: 1,
								pathing: 1,
								x: 0,
								y: 0,
							};
							const start = { x: x1, y: y1 };
							const end = { x: x2, y: y2 };

							it(`start=${JSON.stringify(
								start,
							)}, end=${JSON.stringify(end)}`, () => {
								expect(
									pathingMap._linearPathable(
										entity,
										start,
										end,
									),
								).toBeTruthy();
							});
						}
		});

		describe("blocked", () => {
			const pathing = [
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
			];
			for (let x1 = 0; x1 < 5; x1++)
				for (let x2 = 0; x2 < 5; x2++)
					for (let y1 = 0; y1 < 5; y1++)
						for (let y2 = 0; y2 < 5; y2++) {
							const dx = Math.abs(x2 - x1);
							const dy = Math.abs(y2 - y1);

							if (dx === 0 && dy === 0) continue;

							const pathingMap = new PathingMap({ pathing });
							const entity = {
								radius: 1,
								pathing: 1,
								x: 0,
								y: 0,
							};
							const start = { x: x1, y: y1 };
							const end = { x: x2, y: y2 };

							it(`start=${JSON.stringify(
								start,
							)}, end=${JSON.stringify(end)}`, () => {
								const expected =
									// Start or end in invalid places
									x1 === 0 ||
									x2 === 0 ||
									y1 === 0 ||
									y2 === 0 ||
									(x1 > 1 && x1 < 5 && y1 > 2 && y1 < 5) ||
									(x2 > 1 && x2 < 5 && y2 > 2 && y2 < 5) ||
									// Diagonal movements not possible
									(dx > 0 && dy > 0) ||
									// Doing a monodirectional cross through the middle
									(!dy &&
										dx &&
										((y1 > 1 && y1 < 5) ||
											(y2 > 1 && y2 < 5))) ||
									(!dx &&
										dy &&
										((x1 > 1 && x1 < 5) ||
											(x2 > 1 && x2 < 5)))
										? false
										: true;

								expect(
									pathingMap._linearPathable(
										entity,
										start,
										end,
									),
								).toEqual(expected);
							});
						}
		});
	});
});

describe("PathingMap#path", () => {
	describe("radius=0.5", () => {
		const defaultPathing = [
			[0, 0, 0],
			[0, 3, 0],
			[0, 0, 0],
		];
		const setup = ({
			x,
			y,
			pathing = defaultPathing,
		}: {
			x: number;
			y: number;
			pathing?: number[][];
		}) => {
			const pathingMap = new PathingMap({ pathing });
			const entity = {
				radius: 0.5,
				x,
				y,
				requiresPathing: 1,
				pathing: PATHING_TYPES.WALKABLE,
			};

			return { pathingMap, entity };
		};

		it("open horizontal", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 0.5 });

			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 0],
				[0, 0, 0],
			]);

			expect(pathingMap.path(entity, { x: 2.5, y: 0.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
			]);
		});

		it("blocked horizontal", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 1.5 });

			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 0],
				[0, 0, 0],
			]);

			expect(pathingMap.path(entity, { x: 2.5, y: 1.5 })).toEqual([
				{ x: 0.5, y: 1.5 },
				{ x: 0.5, y: 2.5 },
				{ x: 2.5, y: 2.5 },
				{ x: 2.5, y: 1.5 },
			]);
		});

		it("open vertical", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 0.5 });

			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 0],
				[0, 0, 0],
			]);

			expect(pathingMap.path(entity, { x: 0.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 0.5, y: 2.5 },
			]);
		});

		it("blocked vertical", () => {
			const { pathingMap, entity } = setup({ x: 1.5, y: 0.5 });

			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 0],
				[0, 0, 0],
			]);

			expect(pathingMap.path(entity, { x: 1.5, y: 2.5 })).toEqual([
				{ x: 1.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
				{ x: 2.5, y: 2.5 },
				{ x: 1.5, y: 2.5 },
			]);
		});

		it("open diagonal", () => {
			const { pathingMap, entity } = setup({
				x: 0.5,
				y: 0.5,
				pathing: array2(3, 3),
			});

			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			]);

			expect(pathingMap.path(entity, { x: 2.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 2.5 },
			]);
		});

		it("blocked diagonal", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 0.5 });

			expectGrid(pathingMap, [
				[0, 0, 0],
				[0, 3, 0],
				[0, 0, 0],
			]);

			expect(pathingMap.path(entity, { x: 2.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
				{ x: 2.5, y: 2.5 },
			]);
		});

		it("u-turn", () => {
			const { pathingMap, entity } = setup({
				x: 0.5,
				y: 2.5,
				pathing: [
					[0, 0, 0],
					[0, 3, 0],
					[0, 3, 0],
				],
			});

			expect(pathingMap.path(entity, { x: 2.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 2.5 },
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
				{ x: 2.5, y: 2.5 },
			]);
		});
	});

	describe("radius=1", () => {
		const defaultPathing = [
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 3, 3, 0, 0],
			[0, 0, 3, 3, 0, 0],
			[0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0],
		];
		const setup = ({
			x,
			y,
			pathing = defaultPathing,
		}: {
			x: number;
			y: number;
			pathing?: number[][];
		}) => {
			const pathingMap = new PathingMap({ pathing });
			const entity = {
				radius: 1,
				x,
				y,
				requiresPathing: 1,
				pathing: PATHING_TYPES.WALKABLE,
			};

			return { pathingMap, entity };
		};

		it("open horizontal", () => {
			const { pathingMap, entity } = setup({ x: 1, y: 1 });

			expect(pathingMap.path(entity, { x: 5, y: 1 })).toEqual([
				{ x: 1, y: 1 },
				{ x: 5, y: 1 },
			]);
		});

		it("blocked horizontal", () => {
			const { pathingMap, entity } = setup({ x: 1, y: 3 });

			expect(pathingMap.path(entity, { x: 5, y: 3 })).toEqual([
				{ x: 1, y: 3 },
				{ x: 1, y: 1 },
				{ x: 5, y: 1 },
				{ x: 5, y: 3 },
			]);
		});

		it("open vertical", () => {
			const { pathingMap, entity } = setup({ x: 1, y: 1 });

			expect(pathingMap.path(entity, { x: 1, y: 5 })).toEqual([
				{ x: 1, y: 1 },
				{ x: 1, y: 5 },
			]);
		});

		it("blocked vertical", () => {
			const { pathingMap, entity } = setup({ x: 3, y: 1 });

			expect(pathingMap.path(entity, { x: 3, y: 5 })).toEqual([
				{ x: 3, y: 1 },
				{ x: 1, y: 1 },
				{ x: 1, y: 5 },
				{ x: 3, y: 5 },
			]);
		});

		it("open diagonal", () => {
			const { pathingMap, entity } = setup({
				x: 1,
				y: 1,
				pathing: array2(6, 6),
			});

			expect(pathingMap.path(entity, { x: 5, y: 5 })).toEqual([
				{ x: 1, y: 1 },
				{ x: 5, y: 5 },
			]);
		});

		it("blocked diagonal", () => {
			const { pathingMap, entity } = setup({ x: 1, y: 1 });

			expect(pathingMap.path(entity, { x: 5, y: 5 })).toEqual([
				{ x: 1, y: 1 },
				{ x: 5, y: 1 },
				{ x: 5, y: 5 },
			]);
		});

		it("u-turn", () => {
			const pathing = [
				[0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
				[0, 0, 3, 3, 0, 0],
			];
			const { pathingMap, entity } = setup({ x: 1, y: 5, pathing });

			expect(pathingMap.path(entity, { x: 5, y: 5 })).toEqual([
				{ x: 1, y: 5 },
				{ x: 1, y: 1 },
				{ x: 5, y: 1 },
				{ x: 5, y: 5 },
			]);
		});
	});

	// effectively radius=2
	describe("radius=0.5, resolution=4", () => {
		const defaultPathing = [
			[0, 0, 0],
			[0, 1, 0],
			[0, 0, 0],
		];
		const setup = ({
			x,
			y,
			pathing = defaultPathing,
		}: {
			x: number;
			y: number;
			pathing?: number[][];
		}) => {
			const pathingMap = new PathingMap({ pathing, resolution: 4 });
			const entity = {
				radius: 0.5,
				x,
				y,
				requiresPathing: 1,
				pathing: PATHING_TYPES.WALKABLE,
			};

			return { pathingMap, entity };
		};

		it("open horizontal", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 0.5 });

			expectGrid(pathingMap, [
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			]);
			expect(pathingMap.path(entity, { x: 2.5, y: 0.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
			]);
		});

		it("blocked horizontal", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 1.5 });

			expect(pathingMap.path(entity, { x: 2.5, y: 1.5 })).toEqual([
				{ x: 0.5, y: 1.5 },
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
				{ x: 2.5, y: 1.5 },
			]);
		});

		it("open vertical", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 0.5 });

			expect(pathingMap.path(entity, { x: 0.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 0.5, y: 2.5 },
			]);
		});

		it("blocked vertical", () => {
			const { pathingMap, entity } = setup({ x: 1.5, y: 0.5 });

			expect(pathingMap.path(entity, { x: 1.5, y: 2.5 })).toEqual([
				{ x: 1.5, y: 0.5 },
				{ x: 0.5, y: 0.5 },
				{ x: 0.5, y: 2.5 },
				{ x: 1.5, y: 2.5 },
			]);
		});

		it("open diagonal", () => {
			const { pathingMap, entity } = setup({
				x: 0.5,
				y: 0.5,
				pathing: array2(3, 3),
			});

			expect(pathingMap.path(entity, { x: 2.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 2.5 },
			]);
		});

		it("blocked diagonal", () => {
			const { pathingMap, entity } = setup({ x: 0.5, y: 0.5 });

			expect(pathingMap.path(entity, { x: 2.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
				{ x: 2.5, y: 2.5 },
			]);
		});

		it("u-turn", () => {
			const { pathingMap, entity } = setup({
				x: 0.5,
				y: 2.5,
				pathing: [
					[0, 0, 0],
					[0, 3, 0],
					[0, 3, 0],
				],
			});

			expect(pathingMap.path(entity, { x: 2.5, y: 2.5 })).toEqual([
				{ x: 0.5, y: 2.5 },
				{ x: 0.5, y: 0.5 },
				{ x: 2.5, y: 0.5 },
				{ x: 2.5, y: 2.5 },
			]);
		});
	});
});
