// Oscar Saharoy 2023

import * as u from "./utility.js";
import { tileMappingFunction } from "./mapping.js";
import { colourFunction, rootTileColourFunction } from "./palette.js";
import { svg } from "./subdivide.js";

const xmlns = "http://www.w3.org/2000/svg";


const rootFingerprint = {
	depth: 0,
	alternator: 0,
	cumulativeIndex: 0,
	cumulativeMovement: [ 0, 0 ],
	...rootTileColourFunction(),
};

function calcFingerprint( subtile, subtileIndex, parentTile ) {

	if( subtileIndex === undefined || parentTile === undefined )
		return rootFingerprint;

	const [x, y, svgWidth, svgHeight ] = svg.getAttribute("viewBox").split(" ").map(s => +s);
	const svgOrigin = [x, y];
	const svgCentre = u.addVec(
		svgOrigin,
		[ svgWidth/2, svgHeight/2 ]
	);
	const lengthScale = Math.max( svgWidth, svgHeight );
	const normalise = vert => u.scaleVec(
		u.subVec(vert, svgCentre), 1/lengthScale
	);

	const normalisedVerts = parentTile.verts.map( normalise );
	const normalisedSubtileVerts = subtile.verts.map( normalise );

	const normalisedTileCentre = u.meanVec( normalisedVerts );
	const normalisedSubtileCentre = u.meanVec( normalisedSubtileVerts );
	const movement = u.subVec( normalisedSubtileCentre, normalisedTileCentre );

	let fingerprint = { 
		corners: subtile.verts.length,
		depth: parentTile.fingerprint.depth + 1,
		subtileIndex: subtileIndex,
		cumulativeIndex: parentTile.fingerprint.cumulativeIndex + subtileIndex,
		alternator: parentTile.fingerprint.alternator + (subtileIndex+1) % 2,
		centre: normalisedSubtileCentre,
		movement: movement,
		cumulativeMovement: u.addVec(
			parentTile.fingerprint.cumulativeMovement,
			movement,
		),
	};

	fingerprint = { ...fingerprint, ...colourFunction( fingerprint ) };

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
		this.staticCount = 0;
	}

	toPath() {
		this.pathElm = document.createElementNS( xmlns, "path" );
		this.pathElm.setAttribute( "d", u.vertsToD(this.verts) );
		this.pathElm.setAttribute( "fill", this.fingerprint.fill );
		this.pathElm.setAttribute( "stroke", this.fingerprint.stroke );
		this.pathElm.setAttribute( "style", this.fingerprint.style );
		this.pathElm.setAttribute( "fingerprint", JSON.stringify(this.fingerprint).replaceAll('"',"") );

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

		if( !subdivisionRule ) {
			++this.staticCount;
			return [ this ];
		}

		if( !this.subtiles.length ) this.calcSubtiles(subdivisionRule);

		this.current = false;
		return this.subtiles;
	}

	unsubdivide() {
		
		if( this.parentTile.current ) return [];
		if( this.staticCount-- > 0 ) return [ this ];
		
		this.current = false;
		this.parentTile.current = true;

		return [ this.parentTile ];
	}

	recolour() {
		const rootOrNormalColourFunc =
			this.fingerprint.depth === 0 ? rootTileColourFunction : colourFunction;
		this.fingerprint = { ...this.fingerprint, ...rootOrNormalColourFunc( this.fingerprint ) };

		this.pathElm.setAttribute( "fill", this.fingerprint.fill );
		this.pathElm.setAttribute( "stroke", this.fingerprint.stroke );
		this.pathElm.setAttribute( "style", this.fingerprint.style );

		this.subtiles.forEach( tile => tile.recolour() );
	}
}

