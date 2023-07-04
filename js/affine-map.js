// Oscar Saharoy 2023

import * as u from "./utility.js";


export function calcAffineTransform( sourceTriplet, targetTriplet ) {

	// targetMat = A @ sourceMat

	const sourceMat = u.transpose( sourceTriplet.map( p => [...p, 1] ) );
	const targetMat = u.transpose( targetTriplet.map( p => [...p, 1] ) );

	return u.matMatMul( targetMat, u.inverse(sourceMat) );
}


export function mapFromTileSpace( innerTileSpaceVert, tile ) {

	const outerVerts = tile.verts;
	const outerTileSpaceVerts = tile.tileSpaceVerts;

	for( let i = 0; i < tile.verts.length; ++i ) {

		const a = i;
		const b = ( i + 1 ) % tile.verts.length;

		const tileSpaceDirections = [
			u.normalise( outerTileSpaceVerts[a] ),
			u.normalise( outerTileSpaceVerts[b] ),
		];

		if( !u.betweenDirections( innerTileSpaceVert, tileSpaceDirections ) )
			continue;

		const transform = calcAffineTransform(
			[[0,0], outerTileSpaceVerts[a], outerTileSpaceVerts[b]],
			[u.meanVec(outerVerts), outerVerts[a], outerVerts[b] ],
		);

		return u.matVecMul( transform, [...innerTileSpaceVert, 1] ).slice(0,2);
	}

	throw "fell through";
}


export function affineTileMap( subtiles, tile ) {

	subtiles.forEach(
		subtile => subtile.verts = subtile.verts.map( 
			vert => mapFromTileSpace( vert, tile ) 
		)
	);

	return subtiles;
}

