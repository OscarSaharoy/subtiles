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

	[ fingerprint.fill, fingerprint.stroke ] = colourFunction( fingerprint );

	return fingerprint;
}


export class SVGTile {
	
	constructor( verts ) {

		this.verts = verts;
		this.fingerprint = { depth: 0, fill: "white", stroke: "black" };
	}

	subdivide( subdivisionRules ) {

		const [ tileSpaceVerts, innerTileSpaceVerts ] = [ subdivisionRules["*"].srcVerts, subdivisionRules["*"].dstVertArray ]; // TODO support more than 1 rule

		const subtileVerts = tileMappingFunction( tileSpaceVerts, innerTileSpaceVerts, this.verts );

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
		return `<path 
			d="${ u.vertsToD(this.verts) }"
			fill="${ this.fingerprint.fill }"
			stroke="${ this.fingerprint.stroke }"
			data="${ JSON.stringify(this.fingerprint).replaceAll(" ","").replaceAll("\"","") }"
		/>`;
	}
}

