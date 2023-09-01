// Oscar Saharoy 2023

import * as u from "./utility.js";
import { tileMappingFunction } from "./mapping.js";
import { colourFunction } from "./palette.js";
import { svg } from "./subdivide.js";

const xmlns = "http://www.w3.org/2000/svg";


function calcFingerprint( subtile, subtileIndex, parentTile ) {

	if( subtileIndex === undefined || parentTile === undefined )
		return { depth: 0, fill: "white", stroke: "black" };

	const [x, y, svgWidth, svgHeight ] = svg.getAttribute("viewBox").split(" ").map(s => +s);
	const svgOrigin = [x, y];
	const lengthScale = Math.max( svgWidth, svgHeight );
	const normalise = vert => u.scaleVec( u.subVec(vert, svgOrigin), 1/lengthScale );

	const normalisedVerts = parentTile.verts.map( normalise );
	const normalisedSubtileVerts = subtile.verts.map( normalise );

	const normalisedTileCentre = u.meanVec( normalisedVerts );
	const normalisedSubtileCentre = u.meanVec( normalisedSubtileVerts );

	const fingerprint = { 
		corners: parentTile.verts.length,
		depth: parentTile.fingerprint.depth + 1,
		cumulativeIndex: parentTile.fingerprint.cumulativeIndex + subtileIndex,
		alternator: (parentTile.fingerprint.alternator || 0) + (subtileIndex+1) % 2,
		centre: normalisedSubtileCentre,
		movement: u.subVec( normalisedSubtileCentre, normalisedTileCentre ),
	};

	[ fingerprint.fill, fingerprint.stroke ] = colourFunction( fingerprint );

	return fingerprint;
}


export class SVGTile {
	
	constructor( verts, subtileIndex, parentTile ) {

		this.verts = verts;
		this.parentTile = parentTile;
		this.subtiles = [];

		this.area = Math.abs( u.signedArea( this.verts ) );
		this.fingerprint = calcFingerprint( this, subtileIndex, parentTile );
		this.pathElm = this.toPath();
		this.current = true;
	}

	toPath() {
		this.pathElm = document.createElementNS( xmlns, "path" );
		this.pathElm.setAttribute( "d", u.vertsToD(this.verts) );
		this.pathElm.setAttribute( "fill", this.fingerprint.fill );
		this.pathElm.setAttribute( "stroke", this.fingerprint.stroke );
		this.pathElm.setAttribute( "fingerprint", this.fingerprint );

		return this.pathElm;
	}

	calcSubtiles( subdivisionRule ) {

		const [ tileSpaceVerts, innerTileSpaceVerts ] =
			[ subdivisionRule.srcVerts, subdivisionRule.dstVertArray ];

		const subtileVerts = tileMappingFunction( tileSpaceVerts, innerTileSpaceVerts, this.verts );

		this.subtiles = subtileVerts.map( (vertArray, subtileIndex) =>
			new SVGTile( vertArray, subtileIndex, this )
		);
	}

	subdivide( subdivisionRules ) {
		
		const nVerts = this.verts.length;
		const subdivisionRule = subdivisionRules[nVerts];

		if( !subdivisionRule )
			return [ this ];

		if( !this.subtiles.length ) this.calcSubtiles(subdivisionRule);

		this.current = false;
		return this.subtiles;
	}

	unsubdivide() {
		
		if( this.parentTile.current ) return [];
		
		this.current = false;
		this.parentTile.current = true;

		return [ this.parentTile ];
	}
}

