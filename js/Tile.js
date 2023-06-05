// Oscar Saharoy 2023

import { connectArray, vertsToD } from "./utility.js";


export class Tile {

	constructor( verts ) {
		this.next = this.prev = null;
		this.verts = verts;
	}

	subdivide() {
		return [ this ];
	}

	toSVG() {
		return `<path 
			d="${ vertsToD(this.verts) }"
		/>`;
	}
}


function mapFromTileSpace( innerTileSpaceVerts, outerTileSpaceVerts, outerVerts ) {
	return innerTileSpaceVerts;
}

export class TwistTile extends Tile {

	subdivide() {
		
		const innerTileVerts = mapFromTileSpace(
			[ [-0.95,-1], [1,-0.95], [0.95,1], [-1,0.95] ], 
			[ [-1,-1], [1,-1], [1,1], [-1,1] ],
			this.verts
		);

		const tiles = [ new Tile( this.verts ), new TwistTile( innerTileVerts ) ];

		return connectArray( tiles );
	}
}
