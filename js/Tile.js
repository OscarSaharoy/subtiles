// Oscar Saharoy 2023

import * as utility from "./utility.js";


export class Tile {

	static tileSpaceVerts = [];

	constructor( verts, depth = 0 ) {
		this.next = this.prev = null;
		this.verts = verts ?? this.__proto__.constructor.tileSpaceVerts;
		this.depth = depth;
	}

	subdivide() {
		return [ this ];
	}

	toSVG() {
		return `<path 
			d="${ utility.vertsToD(this.verts) }"
			fill="${ utility.depthToColour(this.depth) }"
			stroke="${ utility.depthToColour(this.depth+5) }"
		/>`;
	}
}


export class TwistTile extends Tile {

	static tileSpaceVerts = [ [-1,-1], [1,-1], [1,1], [-1,1] ];

	subdivide() {
		
		const innerTileSpaceVerts = 
			[ [-0.95,-1], [1,-0.95], [0.95,1], [-1,0.95] ];

		const innerTileVerts = innerTileSpaceVerts.map( vert => utility.mapFromTileSpace( vert, this ) );


		const tiles = [ new Tile( this.verts, this.depth ), new TwistTile( innerTileVerts, this.depth+1 ) ];

		return utility.connectArray( tiles );
	}
}


export class HalvingTile extends Tile {

	static tileSpaceVerts = [ [-1,-1], [1,-1], [1,1], [-1,1] ];

	subdivide() {
		
		const subtiles = utility.mapTilesFromTileSpace([

			new Tile(         [ [-1,-1], [0,-1], [0,1], [-1,1] ], this.depth   ),
			new HalvingTile(  [ [ 1,-1], [1, 1], [0,1], [0,-1] ], this.depth+1 ) 

		], this);

		return utility.connectArray( subtiles );
	}
}

