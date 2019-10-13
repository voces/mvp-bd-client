
import { stringMap } from "./util.js";

const base = {
	name: "The Target",
	// For jumping
	layers: stringMap( `
		2222222222222222222222222222222222222222
		2222222222222222222222222222222222222222
		22        22222222        22222222    22
		22        22222 2          2 22222    22
		22           222            222       22
		22           22                       22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22         2222              22       22
		22         2222                       22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22                                    22
		22            22            22        22
		22        2222222          2222222    22
		22        22222222        222 2222    22
		2222222222222222222222222222222222222222
		2222222222222222222222222222222222222222
    ` ),
	// 0 = open space
	// 1 = crosser spawn
	// 2 = crosser target
	// 3 = defender spawn
	tiles: stringMap( `
		0000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000333300022000
		0001100000000000000000000000333300022000
		0001100000000000000000000000333300022000
		0001100000000000000000000000333300022000
		0001100000000000000000000000333300022000
		0001100000000000000000000000333300022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0001100000000000000000000000000000022000
		0000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
		0000000000000000000000000000000000000000
    ` ),
};

// This makes it easy to develop a new arena, so leaving it here
// base.tiles = base.layers.map( r => r.map( () => 0 ) );
// base.tiles[ Math.floor( base.tiles.length / 2 ) ][ Math.floor( base.tiles[ 0 ].length / 2 ) ] = 1;

export default base;
