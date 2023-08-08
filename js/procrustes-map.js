// Oscar Saharoy 2023

import * as u from "./utility.js";


function procrustesMap( vert, centre, scale, rotation, translation ) {

	const relativeToCentre = u.subVec( vert, centre );
	const scaled           = u.scaleVec( relativeToCentre, scale );
	const rotated          = u.matVecMul( u.rotation2D(rotation), scaled );
	const translated       = u.addVec( rotated, u.addVec( translation, centre ) );

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

	const srcCentre = u.tileCentroid( srcVerts );
	const dstCentre = u.tileCentroid( dstVerts );


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
	const angleDeltas = u.range( srcVerts.length ).map( i =>
		srcVertAngles[i] - dstVertAngles[i]
	);
	const phaseOfSum = Math.atan2(
		angleDeltas.reduce( (sum, d) => sum + Math.sin(d), 0),
		angleDeltas.reduce( (sum, d) => sum + Math.cos(d), 0),
	);

	const rotation = - phaseOfSum || 0;


	return [ srcCentre, scale, rotation, translation ];
}


export function procrustesTileMap( outerTileSpaceVerts, innerTileSpaceVerts, outerVerts ) {

	const params = findMapParams( outerTileSpaceVerts, outerVerts );

	const tileSpaceEdgeSegments = u.vertsToSegments( outerTileSpaceVerts );
	const edgeSegments = u.vertsToSegments( outerVerts );

	const subtileVerts = innerTileSpaceVerts.map(
		vertArray => vertArray.map( 
			vert => edgeMap( vert, tileSpaceEdgeSegments, edgeSegments ) 
				 || procrustesMap( vert, ...params )
		)
	);

	return subtileVerts;
}

