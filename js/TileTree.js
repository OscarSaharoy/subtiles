// Oscar Saharoy 2023


export class TileTree {
	
	constructor( intialTiles, subdivisionRuleMap = {} ) {
		this.tiles = intialTiles;
		this.subdivisionRuleMap = subdivisionRuleMap;
	}

	subdivide() {

		this.tiles = this.tiles.map( tile => tile.subdivide(this.subdivisionRuleMap) ).flat();
		return this;
	}

	toSVG() {

		let parsedTiles = this.tiles
			.map( tile => [tile.toSVG(), tile.area()] )
			.sort( ( [svg1, area1], [svg2, area2] ) => area2 - area1 );

		return parsedTiles.map( ([svg, area]) => svg ).join( "\n" );
	}
}

