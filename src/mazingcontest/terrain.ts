import {
	processArena,
	stringMap,
	stringMapWithRamps,
} from "../engine/entities/terrainHelpers";

export const terrain = processArena({
	name: "Mazing Contest",
	// For jumping
	cliffs: stringMapWithRamps(
		`
			00000000000000000
			00000000000000000
			00000000000000000
			00022221112222000
			00021111111112000
			00021       12000
			00021       12000
			00021       12000
			00021       12000
			00021       12000
			00021       12000
			00021       12000
			00021111111112000
			00022221112222000
			00000000000000000
			00000000000000000
			00000000000000000
		`,
		1,
	),
	tiles: stringMap(`
		00000000000000000
		0               0
		0               0
		0      111      0
		0               0
		0               0
		0               0
		0               0
		0               0
		0               0
		0               0
		0               0
		0               0
		0      111      0
		0               0
		0               0
		00000000000000000
	`),
});
