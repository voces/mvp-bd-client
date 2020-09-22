import { InternalArena } from "./types";
import { stringMap } from "./util";

export const theTinyRectangle: InternalArena = {
	name: "The Tiny Rectangle",
	// For jumping
	cliffs: stringMap(`
		 222222222222222222222222222222222222222
		2222222222222222222222222222222222222222
		222                                   22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		2222222222222222222222222222222222222222
		2222222222222222222222222222222222222222
    `),
	// 0 = open space
	// 1 = crosser spawn
	// 2 = crosser target
	// 3 = defender spawn
	tiles: stringMap(`
		 000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
		0001100000000000000000000000000000022000
		0001100000000000000000000000003333022000
		0001100000000000000000000000003333022000
		0001100000000000000000000000003333022000
		0001100000000000000000000000003333022000
		0001100000000000000000000000003333022000
		0001100000000000000000000000003333022000
		0001100000000000000000000000000000022000
		0000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
    `),
};
