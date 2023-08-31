// Oscar Saharoy 2023


export class TileTree {
	
	constructor( intialTiles, subdivisionRuleMap = {} ) {
		this.currentTiles = this.rootTiles = intialTiles;
		this.subdivisionRuleMap = subdivisionRuleMap;
	}

	async subdivide(svg) {

		this.currentTiles = this.currentTiles.map( tile => tile.subdivide(this.subdivisionRuleMap) ).flat();
		svg.innerHTML = "";
		svg.append( ...this.toPaths() );
	}

	async unsubdivide() {

		this.tiles = this.tiles.map( tile => tile.subdivide(this.subdivisionRuleMap) ).flat();
		return this;
	}

	toPaths() {

		let parsedTiles = this.currentTiles
			.map( tile => [tile.pathElm, tile.area()] )
			.sort( ( [path1, area1], [path2, area2] ) => area2 - area1 );

		return parsedTiles.map( ([path, area]) => path );
	}
}

