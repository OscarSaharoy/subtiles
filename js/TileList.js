// Oscar Saharoy 2023

import { connect, getFirstLast } from "./utility.js";


export class TileList {
	
	constructor( first = null ) {
		this.tiles = [ first ];
		this.subdivisionRules = {};
	}

	subdivide() {

		this.tiles = this.tiles.map( tile => tile.subdivide() ).flat();
		return this;
	}

	toSVG() {

		let parsedTiles = this.tiles
			.map( tile => [tile.toSVG(), tile.area()] )
			.sort( ( [svg1, area1], [svg2, area2] ) => area2 - area1 );

		return parsedTiles.map( ([svg, area]) => svg ).join( "\n" );
	}
}

