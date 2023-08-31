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

	toPaths() {

		let parsedTiles = this.tiles
			.map( tile => [tile.toPath(), tile.area()] )
			.sort( ( [path1, area1], [path2, area2] ) => area2 - area1 );

		return parsedTiles.map( ([path, area]) => path );
	}
}

