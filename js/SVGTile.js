// Oscar Saharoy 2023

import * as u from "./utility.js";
import { tileMappingFunction } from "./mapping.js";
import { colourFunction } from "./palette.js";
import { svg } from "./subdivide.js";

const xmlns = "http://www.w3.org/2000/svg";


function calcFingerprint( subtile, subtileIndex, tile ) {

	const [x, y, svgWidth, svgHeight ] = svg.getAttribute("viewBox").split(" ").map(s => +s);
	const svgOrigin = [x, y];
	const lengthScale = Math.max( svgWidth, svgHeight );
	const normalise = vert => u.scaleVec( u.subVec(vert, svgOrigin), 1/lengthScale );

	const normalisedVerts = tile.verts.map( normalise );
	const normalisedSubtileVerts = subtile.verts.map( normalise );

	const normalisedTileCentre = u.meanVec( normalisedVerts );
	const normalisedSubtileCentre = u.meanVec( normalisedSubtileVerts );

	const fingerprint = { 
		corners: tile.verts.length,
		depth: tile.fingerprint.depth + 1,
		cumulativeIndex: tile.fingerprint.cumulativeIndex + subtileIndex,
		alternator: (tile.fingerprint.alternator || 0) + (subtileIndex+1) % 2,
		centre: normalisedSubtileCentre,
		movement: u.subVec( normalisedSubtileCentre, normalisedTileCentre ),
	};

	[ fingerprint.fill, fingerprint.stroke ] = colourFunction( fingerprint );

	return fingerprint;
}


export class SVGTile {
	
	constructor( verts ) {

		this.verts = verts;
		this.fingerprint = { depth: 0, fill: "white", stroke: "black" };
		this.parent = null;
		this.children = [];
		this.pathElm = null;
	}

	subdivide( subdivisionRules ) {

		const nVerts = this.verts.length;
		const subdivisionRule = subdivisionRules[nVerts];

		if( !subdivisionRule )
			return [ this ];

		const [ tileSpaceVerts, innerTileSpaceVerts ] =
			[ subdivisionRules[nVerts].srcVerts, subdivisionRules[nVerts].dstVertArray ];

		const subtileVerts = tileMappingFunction( tileSpaceVerts, innerTileSpaceVerts, this.verts );

		const subtiles = this.children = subtileVerts.map( vertArray =>
			new SVGTile( vertArray )
		);
		subtiles.forEach( (subtile, i) =>
			[ subtile.fingerprint, subtile.parent ] = [ calcFingerprint( subtile, i, this ), this ]
		);

		return subtiles;
	}

	area() {
		return Math.abs( u.signedArea( this.verts ) );
	}

	toPath() {
		self.pathElm = document.createElementNS( xmlns, "path" );
		self.pathElm.setAttribute( "d", u.vertsToD(this.verts) );
		self.pathElm.setAttribute( "fill", this.fingerprint.fill );
		self.pathElm.setAttribute( "stroke", this.fingerprint.stroke );
		self.pathElm.setAttribute( "fingerprint", this.fingerprint );

		return self.pathElm;
	}
}

