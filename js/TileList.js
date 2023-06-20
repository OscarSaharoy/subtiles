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
		let svgStrings = [];

		while( tile != this ) {
			
			svgStrings.push( tile.toSVG() );
			tile = tile.next;
		}

		return svgStrings.join( "\n" );
	}
}

