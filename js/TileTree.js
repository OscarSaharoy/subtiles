// Oscar Saharoy 2023

import { updateSubtilesCount } from "./subdivide.js";


function sortTilesByArea( tiles ) {

	return tiles.sort( (tileA, tileB) => tileB.area - tileA.area );
}


export class TileTree {
	
	constructor( intialTiles, subdivisionRuleMap = {} ) {
		this.currentTiles = this.rootTiles = intialTiles;
		this.subdivisionRuleMap = subdivisionRuleMap;
	}

	subdivide(svg) {

		this.currentTiles = sortTilesByArea( this.currentTiles.map(
			tile => tile.subdivide( this.subdivisionRuleMap )
		).flat() );

		svg.innerHTML = "";
		svg.append( ...this.currentTiles.map( tile => tile.pathElm ) );	
	}

	unsubdivide(svg) {

		this.currentTiles = this.currentTiles.map(
			tile => tile.unsubdivide()
		).flat();

		svg.innerHTML = "";
		svg.append( ...this.currentTiles.map( tile => tile.pathElm ) );	
	}

	recolour() {
		this.rootTiles.forEach( tile => tile.recolour() );
	}
}

