// Oscar Saharoy 2023

import { updateSubtilesCount } from "./subdivide.js";


export class TileTree {
	
	constructor( intialTiles, subdivisionRuleMap = {} ) {
		this.currentTiles = this.rootTiles = intialTiles;
		this.subdivisionRuleMap = subdivisionRuleMap;
	}

	async subdivide(svg) {

		const newCurrentTiles = [];
		for( const tile of this.currentTiles ) {
			newCurrentTiles.push( await tile.subdivide( this.subdivisionRuleMap, svg ) );
		}
		this.currentTiles = newCurrentTiles.flat();

		return
		const subdivisionPromises = this.currentTiles.map( tile => tile.subdivide(this.subdivisionRuleMap, svg) );
		this.currentTiles = (await Promise.all( subdivisionPromises )).flat();
	}

	async unsubdivide(svg) {

		const newCurrentTiles = [];
		for( const tile of this.currentTiles ) {
			newCurrentTiles.push( await tile.unsubdivide( this.subdivisionRuleMap, svg ) );
		}
		this.currentTiles = newCurrentTiles.flat();

		return
		this.tiles = this.tiles.map( tile => tile.subdivide(this.subdivisionRuleMap) ).flat();
		return this;
	}
}

