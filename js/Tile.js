// Oscar Saharoy 2023

import { connectArray, vertsToD } from "./utility.js";


export class Tile {

	constructor() {
		this.verts = [ [0.25,0.25], [0.25,-0.25], [-0.25,-0.25], [-0.25,0.25] ];
		this.next = this.prev = null;
	}

	subdivide() {
		const tiles = [ new Tile(), new Tile() ];
		connectArray( tiles );
		return tiles;
	}

	toSVG() {
		return `<path 
			d="${ vertsToD(this.verts) }"
		/>`;
	}
}

