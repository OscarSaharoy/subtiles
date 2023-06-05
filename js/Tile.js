// Oscar Saharoy 2023

import { dot, connectArray, vertsToD, meanVec, normalise, matMatMul, matVecMul, inverse, transpose } from "./utility.js";


export class Tile {

	constructor( verts, depth = 0 ) {
		this.next = this.prev = null;
		this.verts = verts;
		this.depth = depth;
	}

	subdivide() {
		return [ this ];
	}

	toSVG() {
		return `<path 
			d="${ vertsToD(this.verts) }"
			fill="${ depthToColour(this.depth) }"
			stroke="${ depthToColour(this.depth+5) }"
		/>`;
	}
}


function depthToColour( depth ) {

	const hue = "190deg";
	const sat = "100%";
	const val = `${depth*0.76}%`;

	return `hsl( ${hue} ${sat} ${val} )`;
}


function betweenDirections( point, [ direction1, direction2 ] ) {

	const pointDirection = normalise(point);

	return dot( pointDirection, direction1 ) >= dot( direction1, direction2)
		&& dot( pointDirection, direction2 ) >= dot( direction1, direction2);
}


function calcAffineTransform( sourceTriplet, targetTriplet ) {

	// targetMat = A @ sourceMat

	const sourceMat = transpose( sourceTriplet.map( p => [...p, 1] ) );
	const targetMat = transpose( targetTriplet.map( p => [...p, 1] ) );

	return matMatMul( targetMat, inverse(sourceMat) );
}


function mapFromTileSpace( innerTileSpaceVert, tile ) {

	const outerVerts = tile.verts;
	const outerTileSpaceVerts = tile.__proto__.constructor.tileSpaceVerts;

	for( let i = 0; i < tile.verts.length; ++i ) {

		const a = i;
		const b = ( i + 1 ) % tile.verts.length;

		const tileSpaceDirections = [
			normalise( outerTileSpaceVerts[a] ),
			normalise( outerTileSpaceVerts[b] ),
		];

		if( !betweenDirections( innerTileSpaceVert, tileSpaceDirections ) )
			continue;

		const transform = calcAffineTransform(
			[[0,0], outerTileSpaceVerts[a], outerTileSpaceVerts[b]],
			[meanVec(outerVerts), outerVerts[a], outerVerts[b] ],
		);

		return matVecMul( transform, [...innerTileSpaceVert, 1] );
	}
}

export class TwistTile extends Tile {

	static tileSpaceVerts = [ [-1,-1], [1,-1], [1,1], [-1,1] ];

	subdivide() {
		
		const innerTileSpaceVerts = 
			[ [-0.95,-1], [1,-0.95], [0.95,1], [-1,0.95] ];

		const innerTileVerts = innerTileSpaceVerts.map( vert => mapFromTileSpace( vert, this ) );


		const tiles = [ new Tile( this.verts, this.depth ), new TwistTile( innerTileVerts, this.depth+1 ) ];

		return connectArray( tiles );
	}
}

