// Oscar Saharoy 2023

export function vertsToD( verts ) {
	return verts.reduce( (acc,v,i) =>
		acc + `${i ? "L" : "M"} ${v[0]},${v[1]} `, ""
	) + "Z";
}

export function connect( firstTile, secondTile ) {
	firstTile.next = secondTile;
	secondTile.prev = firstTile;

	return [ firstTile, secondTile ];
}

export function connectArray( tiles ) {
	tiles.slice( 0, -1 ).forEach( (_,i) =>
		connect( tiles[i], tiles[i+1] )
	);

	return tiles;
}


export function depthToColour( depth ) {

	const hue = "190deg";
	const sat = "100%";
	const val = `${depth*4}%`;

	return `hsl( ${hue} ${sat} ${val} )`;
}


export function betweenDirections( point, [ direction1, direction2 ] ) {

	const pointDirection = normalise(point);

	return dot( pointDirection, direction1 ) >= dot( direction1, direction2)
		&& dot( pointDirection, direction2 ) >= dot( direction1, direction2);
}


export function calcAffineTransform( sourceTriplet, targetTriplet ) {

	// targetMat = A @ sourceMat

	const sourceMat = transpose( sourceTriplet.map( p => [...p, 1] ) );
	const targetMat = transpose( targetTriplet.map( p => [...p, 1] ) );

	return matMatMul( targetMat, inverse(sourceMat) );
}


export function mapFromTileSpace( innerTileSpaceVert, tile ) {

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


export function mapTilesFromTileSpace( subtiles, tile ) {

	subtiles.forEach(
		subtile => subtile.verts = subtile.verts.map( 
			vert => mapFromTileSpace( vert, tile ) 
		)
	);

	return subtiles;
}

export function getFirstLast( array ) {
	return [ array[0], array[array.length - 1] ];
}

export const range = n =>
	Object.keys( Array(n).fill(0) ).map( parseFloat );

export function sum( arr ) {
	return arr.reduce( (acc,val) => acc + val, 0 );
}


export const back = (arr, offset = -1) =>
	arr[ arr.length + offset ]

export const identity = rows =>
	range(rows).map( x => range(rows).map( y => x==y ? 1 : 0 ) );

export const vec0 = rows =>
	Array(rows).fill(0);

export const scaleVec = (vec,f) =>
	vec.map( x => x*f );

export const addVec = (vecA,vecB) =>
	vecA.map( (_,i) => vecA[i] + vecB[i] );

export const subVec = (vecA,vecB) =>
	vecA.map( (_,i) => vecA[i] - vecB[i] );

export const scaleMat = (mat,f) =>
	mat.map( row => scaleVec(row, f) );

export const dot = (vecA,vecB) =>
	vecA.reduce( (sum,_,i) => sum + vecA[i]*vecB[i], 0 );

export const cross = (vecA,vecB) =>
	[
		vecA[1]*vecB[2] - vecA[2]*vecB[1],
		vecA[2]*vecB[0] - vecA[0]*vecB[2],
		vecA[0]*vecB[1] - vecA[1]*vecB[0],
	];

export const meanVec = vecs =>
	scaleVec( 
		vecs.reduce( (acc,vec) => 
			addVec(acc, vec), vec0(vecs[0].length) ),
		1 / vecs.length 
	);

export const length2 = vec =>
	vec.reduce( (acc,val) => acc + val*val, 0 );

export const length = vec =>
	Math.sqrt( length2(vec) );

export const arg = vec =>
	Math.atan2( vec[1], vec[0] );

export const normalise = vec =>
	scaleVec( vec, 1/length(vec) );

export const matVecMul = (mat,vec) =>
	mat.map( row => dot(row, vec) );

export const transpose = mat =>
	mat[0].map( (_,j) => mat.map( (_,i) => mat[i][j] ) );

export const matMatMul = (matA,matB) =>
	transpose(transpose(matB).map( colB => matA.map( rowA => dot(colB,rowA) ) ));

export const matMultiMul = (...mats) =>
	mats.length == 2 ? matMatMul(...mats) : matMatMul( mats[0], matMultiMul(...mats.slice(1)) );


export function inverse( mat ) {

	const rows = mat.length;
	const cols = mat[0].length;

	if( rows != cols ) throw Error("No inverse, nonsquare matrix");

	let r, s, f, value, temp

	if (rows === 1) {
		// this is a 1 x 1 matrix
		value = mat[0][0]
		if (value === 0) {
			throw Error('Cannot calculate inverse, determinant is zero')
		}
		return [[
			divideScalar(1, value)
		]]
	} else if (rows === 2) {
		// this is a 2 x 2 matrix
		const d = det(mat)
		if (d === 0) {
			throw Error('Cannot calculate inverse, determinant is zero')
		}
		return [
			[
				divideScalar(mat[1][1], d),
				divideScalar(unaryMinus(mat[0][1]), d)
			],
			[
				divideScalar(unaryMinus(mat[1][0]), d),
				divideScalar(mat[0][0], d)
			]
		]
	} else {
		// this is a matrix of 3 x 3 or larger
		// calculate inverse using gauss-jordan elimination
		//            https://en.wikipedia.org/wiki/Gaussian_elimination
		//            http://mathworld.wolfram.com/MatrixInverse.html
		//            http://math.uww.edu/~mcfarlat/inverse.htm

		// make a copy of the matrix (only the arrays, not of the elements)
		const A = mat.concat()
		for (r = 0; r < rows; r++) {
			A[r] = A[r].concat()
		}

		// create an identity matrix which in the end will contain the
		// matrix inverse
		const B = identity(rows)

		// loop over all columns, and perform row reductions
		for (let c = 0; c < cols; c++) {
			// Pivoting: Swap row c with row r, where row r contains the largest element A[r][c]
			let ABig = Math.abs(A[c][c])
			let rBig = c
			r = c + 1
			while (r < rows) {
				if (Math.abs(A[r][c]) > ABig) {
					ABig = Math.abs(A[r][c])
					rBig = r
				}
				r++
			}
			if (ABig === 0) {
				throw Error('Cannot calculate inverse, determinant is zero')
			}
			r = rBig
			if (r !== c) {
				temp = A[c]; A[c] = A[r]; A[r] = temp
				temp = B[c]; B[c] = B[r]; B[r] = temp
			}

			// eliminate non-zero values on the other rows at column c
			const Ac = A[c]
			const Bc = B[c]
			for (r = 0; r < rows; r++) {
				const Ar = A[r]
				const Br = B[r]
				if (r !== c) {
					// eliminate value at column c and row r
					if (Ar[c] !== 0) {
						f = -Ar[c] / Ac[c]

						// add (f * row c) to row r to eliminate the value
						// at column c
						for (s = c; s < cols; s++) {
							Ar[s] = Ar[s] + f * Ac[s]
						}
						for (s = 0; s < cols; s++) {
							Br[s] = Br[s] + f * Bc[s]
						}
					}
				} else {
					// normalize value at Acc to 1,
					// divide each value on row r with the value at Acc
					f = Ac[c]
					for (s = c; s < cols; s++) {
						Ar[s] = Ar[s] / f
					}
					for (s = 0; s < cols; s++) {
						Br[s] = Br[s] / f
					}
				}
			}
		}
		return B
	}
}
