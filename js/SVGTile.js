// Oscar Saharoy 2023

import * as u from "./utility.js";
import { tileMappingFunction } from "./mapping.js";
import { colourFunction } from "./palette.js";


function calcFingerprint( subtile, subtileIndex, tile ) {

	const tileCentre = u.meanVec( tile.verts );
	const subtileCentre = u.meanVec( subtile.verts );

	const fingerprint = { 
		corners: tile.verts.length,
		depth: tile.fingerprint.depth + 1,
		cumulativeIndex: tile.fingerprint.cumulativeIndex + subtileIndex,
		alternator: (tile.fingerprint.alternator || 0) + (subtileIndex+1) % 2,
		centre: subtileCentre,
		movement: u.subVec( subtileCentre, tileCentre ),
	};

	return fingerprint;
}


export class SVGTile {
	
	constructor( verts ) {

		this.verts = verts;
		this.fingerprint = { depth: 0 };
	}

	subdivide( subdivisionRules ) {

		const [ tileSpaceVerts, innerTileSpaceVerts ] = [ subdivisionRules["*"].srcVerts, subdivisionRules["*"].dstVertArray ]; // TODO support more than 1 rule

		const subtileVerts = tileMappingFunction( tileSpaceVerts, innerTileSpaceVerts, this.verts ); // TODO fix other maps

		const subtiles = subtileVerts.map( vertArray =>
			new SVGTile( vertArray )
		);
		subtiles.forEach( (subtile, i) => 
			subtile.fingerprint = calcFingerprint( subtile, i, this )
		);

		return subtiles;
	}

	area() {
		return Math.abs( u.signedArea( this.verts ) );
	}

	toSVG() {
		const [ fill, stroke ] = colourFunction(this.fingerprint);

		return `<path 
			d="${ u.vertsToD(this.verts) }"
			fill="${ fill }"
			stroke="${ stroke }"
			${JSON.stringify(this.fingerprint)}
		/>`;
	}
}

