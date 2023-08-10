// Oscar Saharoy 2023

import * as u from "./utility.js";


function calcAffineTransform( sourceTriplet, targetTriplet ) {

	// targetMat = A @ sourceMat

	const sourceMat = u.transpose( sourceTriplet.map( p => [...p, 1] ) );
	const targetMat = u.transpose( targetTriplet.map( p => [...p, 1] ) );

	return u.matMatMul( targetMat, u.inverse(sourceMat) );
}


function affineMap( innerTileSpaceVert, tileSpaceCentroid, mapMatrices ) {
	
	const innerTileSpaceVertDirection = u.subVec( innerTileSpaceVert, tileSpaceCentroid );

	for( const { tileSpaceDirections, matrix } of mapMatrices ) {

		if( !u.betweenDirections( innerTileSpaceVertDirection, tileSpaceDirections ) )
			continue;

		return u.matVecMul( matrix, [...innerTileSpaceVert, 1] ).slice(0,2);
	}
}


function findMapParams( outerTileSpaceVerts, outerVerts ) {

	const tileSpaceCentroid = u.meanVec( outerTileSpaceVerts );
	const centroid = u.meanVec( outerVerts );

	const tileSpaceEdgeSegments = u.vertsToSegments( outerTileSpaceVerts );
	const edgeSegments = u.vertsToSegments( outerVerts );

	const mapMatrices = [];

	for( let i = 0; i < edgeSegments.length; ++i ) {
		
		const tileSpaceEdge = tileSpaceEdgeSegments[i];
		const edge = edgeSegments[i];

		const tileSpaceDirections = [
			u.normalise( tileSpaceEdge[0] ),
			u.normalise( tileSpaceEdge[1] ),
		];

		const matrix = calcAffineTransform(
			[ tileSpaceCentroid, tileSpaceEdge[0], tileSpaceEdge[1] ],
			[          centroid,          edge[0],          edge[1] ],
		);

		mapMatrices.push({ tileSpaceDirections, matrix });
	}

	return mapMatrices;
}

export function affineTileMap( outerTileSpaceVerts, innerTileSpaceVerts, outerVerts ) {

	const tileSpaceCentroid = u.meanVec( outerTileSpaceVerts );
	const mapMatrices = findMapParams( outerTileSpaceVerts, outerVerts );

	const subtileVerts = innerTileSpaceVerts.map(
		vertArray => vertArray.map( 
			vert => affineMap( vert, tileSpaceCentroid, mapMatrices )
		)
	);

	return subtileVerts;
}
