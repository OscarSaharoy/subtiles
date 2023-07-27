// Oscar Saharoy 2023

import { connect, getFirstLast } from "./utility.js";


export class TileList {
	
	constructor( first = null ) {
		this.next = this.prev = first;
		first.prev = first.next = this;
	}

	subdivide() {
		
		let tile = this.next;

		while( tile != this ) {
			
			const subtiles = tile.subdivide();
			const [ firstSubtile, lastSubtile ] = getFirstLast( subtiles );

			connect( tile.prev, firstSubtile );
			connect( lastSubtile, tile.next );

			tile = tile.next;
		}

		return this;
	}

	toSVG() {

		let tile = this.next;
		let parsedTiles = [];

		while( tile != this ) {
			
			parsedTiles.push([ tile.toSVG(), tile.area() ]);
			tile = tile.next;
		}

		parsedTiles = parsedTiles.sort( ( [svg1, area1], [svg2, area2] ) => area2 - area1 );
		console.log( parsedTiles )

		return parsedTiles.map( ([svg, area]) => svg ).join( "\n" );
	}
}

