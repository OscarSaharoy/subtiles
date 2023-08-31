// Oscar Saharoy 2023

import * as u from "./utility.js";
import { tileMappingFunction } from "./mapping.js";
import { colourFunction } from "./palette.js";
import { svg } from "./subdivide.js";

const xmlns = "http://www.w3.org/2000/svg";


function calcFingerprint( subtile, subtileIndex, tile ) {

	if( subtileIndex === undefined || tile === undefined )
		return { depth: 0, fill: "white", stroke: "black" };

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
	
	constructor( verts, subtileIndex, parentTile ) {

		this.verts = verts;
		this.parent = parentTile;
		this.children = [];

		this.fingerprint = calcFingerprint( this, subtileIndex, parentTile );
		this.pathElm = this.toPath();
	}

	toPath() {
		this.pathElm = document.createElementNS( xmlns, "path" );
		this.pathElm.setAttribute( "d", u.vertsToD(this.verts) );
		this.pathElm.setAttribute( "fill", this.fingerprint.fill );
		this.pathElm.setAttribute( "stroke", this.fingerprint.stroke );
		this.pathElm.setAttribute( "fingerprint", this.fingerprint );

		return this.pathElm;
	}

	subdivide( subdivisionRules ) {

		const nVerts = this.verts.length;
		const subdivisionRule = subdivisionRules[nVerts];

		if( !subdivisionRule )
			return [ this ];

		const [ tileSpaceVerts, innerTileSpaceVerts ] =
			[ subdivisionRules[nVerts].srcVerts, subdivisionRules[nVerts].dstVertArray ];

		const subtileVerts = tileMappingFunction( tileSpaceVerts, innerTileSpaceVerts, this.verts );

		const subtiles = this.children = subtileVerts.map( (vertArray, subtileIndex) =>
			new SVGTile( vertArray, subtileIndex, this )
		);

		return subtiles;
	}

	area() {
		return Math.abs( u.signedArea( this.verts ) );
	}
}

