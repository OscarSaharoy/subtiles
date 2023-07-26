// Oscar Saharoy 2023

import * as u from "./utility.js";


function procrustesMap( vert, scale, rotation, translation ) {

	const scaled     = u.scaleVec( vert, scale );
	const rotated    = u.matVecMul( u.rotation2D(rotation), scaled );
	const translated = u.addVec( rotated, translation );

	return translated;
}

function edgeMap( vert, srcEdges, dstEdges ) {
	
	for( let i = 0; i < srcEdges.length; ++i ) {

		const srcEdge = srcEdges[i];
		const dstEdge = dstEdges[i];
		
		if( !u.pointOnSegment( vert, srcEdge ) ) continue;

		const fractionAlongEdge = u.distance( vert, srcEdge[0] ) / u.distance( ...srcEdge );

		return u.addVec( dstEdge[0], u.scaleVec( u.subVec( dstEdge[1], dstEdge[0] ), fractionAlongEdge ) );
	}
}


function findMapParams( srcVerts, dstVerts ) {

	const srcCentre = u.meanVec( srcVerts );
	const dstCentre = u.meanVec( dstVerts );


	const srcSegments = u.vertsToSegments( srcVerts );
	const dstSegments = u.vertsToSegments( dstVerts );

	const maxSrcDist = Math.max( ...srcSegments.map( seg =>
		u.pointSegmentDistance( srcCentre, seg )
	) );
	const minDstDist = Math.min( ...dstSegments.map( seg =>
		u.pointSegmentDistance( dstCentre, seg )
	) );

	const scale = minDstDist / maxSrcDist;


	const translation = u.subVec( dstCentre, srcCentre );

	
	const srcVertAngles = srcVerts.map( vert =>
		u.arg( u.subVec( vert, srcCentre ) )
	);
	const dstVertAngles = dstVerts.map( vert =>
		u.arg( u.subVec( vert, dstCentre ) )
	);

	const calcAngleDelta = ( angle1, angle2 ) => 
		[ angle1 - 2*Math.PI, angle1, angle1 + 2*Math.PI ]
			.map( angle1option => angle1option - angle2 )
			.reduce( (res, val) => Math.abs(val) < Math.abs(res) ? val : res, Infinity );

	const angleDeltas = u.range( srcVerts.length ).map( i =>
		calcAngleDelta( dstVertAngles[i], srcVertAngles[i] )
	);

	const rotation = u.mean( angleDeltas );


	return [ scale, rotation, translation ];
}

export function procrustesTileMap( subtiles, tile ) {

	const params = findMapParams( tile.tileSpaceVerts, tile.verts );

	const tileSpaceEdgeSegments = u.vertsToSegments( tile.tileSpaceVerts );
	const edgeSegments = u.vertsToSegments( tile.verts );
	
	subtiles.forEach(
		subtile => subtile.verts = subtile.verts.map( 
			vert => edgeMap( vert, tileSpaceEdgeSegments, edgeSegments )
				 || procrustesMap( vert, ...params )
		)
	);

	return subtiles;
}

