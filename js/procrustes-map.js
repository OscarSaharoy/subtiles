// Oscar Saharoy 2023

import * as u from "./utility.js";


function procrustesMap( vert, scale, rotation, translation ) {
	
	const scaled     = u.scaleVec( vert, scale );
	const rotated    = u.matVecMul( u.rotation2D(rotation), scaled );
	const translated = u.addVec( rotated, translation );

	return translated;
}


function findMapParams( srcCorners, dstCorners, DoF = undefined ) {

	const srcCovariance = getCovarianceMatrix( srcCorners );
	const dstCovariance = getCovarianceMatrix( dstCorners );

	const scale =
		Math.min( dstCovariance[0][0], dstCovariance[1][1] ) /
		Math.max( srcCovariance[0][0], srcCovariance[1][1] );

	const translation = u.subVec(
		u.meanVec( dstCorners ),
		u.meanVec( srcCorners )
	);

	return [ scale, 0, translation ];
}

export function procrustesTileMap( subtiles, tile ) {

	const params = findMapParams( tile.tileSpaceVerts, tile.verts );

	subtiles.forEach(
		subtile => subtile.verts = subtile.verts.map( 
			vert => procrustesMap( vert, ...params )
		)
	);

	return subtiles;
}

