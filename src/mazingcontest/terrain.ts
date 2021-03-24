import {
	processArena,
	stringMap,
	stringMapWithRamps,
	trimMap,
} from "../engine/entities/terrainHelpers";

const repeat = (map: string) => {
	const h = trimMap(map)
		.split("\n")
		.map((v) => Array(5).fill(v).join("."));
	return Array(4)
		.fill(h.join("\n"))
		.join(`\n${".".repeat(h[0].length)}\n`);
};

export const terrain = processArena({
	name: "Mazing Contest",
	// For jumping
	cliffs: stringMapWithRamps(
		repeat(`
			000000000000000000
			000000000000000000
			000000000000000000
			000222221122222000
			000211111111112000
			00021        12000
			00021        12000
			00021        12000
			00021        12000
			00021        12000
			00021        12000
			00021        12000
			00021        12000
			000211111111112000
			000222221122222000
			000000000000000000
			000000000000000000
			000000000000000000
		`),
		1,
	),
	tiles: stringMap(
		repeat(`
			000000000000000000
			0                0
			0                0
			0       11       0
			0                0
			0                0
			0                0
			0                0
			0                0
			0                0
			0                0
			0                0
			0                0
			0                0
			0       11       0
			0                0
			0                0
			000000000000000000
		`),
	),
});
