// Oscar Saharoy 2023

import * as u from "./utility.js";


const conformalMap = ( z, c0=[0,0], c1=[0,0], k1=[0,0], c2=[0,0], k2=[0,0], c3=[0,0], k3=[0,0] ) => 
	// ( c0 + c1*z + c2*z**2, c3*z**3 ) / ( 1 + k1*z + k2*z**2 + k3*z**3 )
	u.divComp(
		u.addComp( c0, u.mulComp(c1,z), u.mulComps(c2,z,z), u.mulComps(c3,z,z,z) ),
		u.addComp( [1,0], u.mulComp(k1,z), u.mulComps(k2,z,z), u.mulComps(k3,z,z,z) ),
	);


const AcompRow = ( z, zp ) => [
	[1,0], z, u.mulComps([-1,0],z,zp), u.mulComps(z,z), u.mulComps([-1,0],z,z,zp), u.mulComps(z,z,z), u.mulComps([-1,0],z,z,z,zp),
];

function findMapParams( srcVerts, dstVerts, DoF = undefined ) {
	
	DoF = DoF || srcVerts.length;
	if( DoF == 0 ) throw Error( "Unable to solve tile transform" ); 

	try {
		
		const Acomp = srcVerts
			.slice( 0, DoF )
			.map( (z,i) => AcompRow( z, dstVerts[i] ).slice( 0, DoF ) );

		return u.complexGaussianElimination( Acomp, dstVerts.slice( 0, DoF ) );

	} catch {

		return findMapParams( srcVerts, dstVerts, DoF-1 );
	}
}

export function conformalTileMap( subtiles, tile ) {

	const params = findMapParams( tile.tileSpaceVerts, tile.verts );

	subtiles.forEach(
		subtile => subtile.verts = subtile.verts.map( 
			vert => conformalMap( vert, ...params )
		)
	);

	return subtiles;
}

