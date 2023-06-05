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

function squareVerts( centre, toCorner ) {
	const toOtherCorner = [ toCorner[1], -toCorner[0] ];
	
	return [
		utility.addVec( centre, toCorner ),
		utility.addVec( centre, toOtherCorner ),
		utility.subVec( centre, toCorner ),
		utility.subVec( centre, toOtherCorner ),
	];
}

function unitVector( theta ) {
	return [ Math.sin( theta ), Math.cos( theta ) ];
}

function argMag( theta, length ) {
	return utility.scaleVec( unitVector( theta ), length );
}

export class RoseTile extends Tile {

	static tileSpaceVerts = [ [-1,-1], [1,-1], [1,1], [-1,1] ];

	subdivide() {
		
		const subtiles = utility.mapTilesFromTileSpace([

			...utility.range(50)
					.map( i => i/50*6.28 )
					.map( t => new Tile(
						squareVerts(
							unitVector(t),
							argMag( t, 0.1 )
						),
						this.depth )
					),

			new RoseTile( 
				squareVerts(
					[0,0],
					argMag( 0.41, 1.3 )
				),
				this.depth + 1 )

		], this);

		return utility.connectArray( subtiles );
	}
}
