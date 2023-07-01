// Oscar Saharoy 2023

export function vertsToD( verts ) {
	return verts.reduce( (acc,v,i) =>
		acc + `${i ? "L" : "M"} ${v[0]},${v[1]} `, ""
	) + "Z";
}

export function vertsToPythonComplex( verts ) {
	return verts.reduce( (acc,val) =>
		acc + `${val[0]} ${val[1] >= 0 ? "+" : "-"} ${Math.abs(val[1])}j,\n`, ""
	);
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
	const val = `${depth*8}%`;

	return `hsl( ${hue} ${sat} ${val} )`;
}


export function betweenDirections( point, [ direction1, direction2 ] ) {

	const pointDirection = normalise(point);
	const eps = 1e-3;

	return dot( pointDirection, direction1 ) >= dot( direction1, direction2) - eps
		&& dot( pointDirection, direction2 ) >= dot( direction1, direction2) - eps;
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


export function solve( mat, x ) {

	const rows = mat.length;
	const cols = mat[0].length;

	if( rows != cols ) throw Error("No inverse, nonsquare matrix");

	let r, s, f, value, temp

	// make a copy of the matrix (only the arrays, not of the elements)
	const A = mat.map( row => row.map( v => v ) );

	// make a copy of the column vector x which will store the answer at the end
	const b = x.map( v => v );

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
			temp = b[c]; b[c] = b[r]; b[r] = temp
		}

		// eliminate non-zero values on the other rows at column c
		const Ac = A[c]
		for (r = 0; r < rows; r++) {
			const Ar = A[r]
			if (r !== c) {
				// eliminate value at column c and row r
				if (Ar[c] !== 0) {
					f = -Ar[c] / Ac[c]

					// add (f * row c) to row r to eliminate the value
					// at column c
					for (s = c; s < cols; s++) {
						Ar[s] = Ar[s] + f * Ac[s]
					}
					b[r] = b[r] + f * b[c]
				}
			} else {
				// normalize value at Acc to 1,
				// divide each value on row r with the value at Acc
				f = Ac[c]
				for (s = c; s < cols; s++) {
					Ar[s] = Ar[s] / f
				}
				b[r] = b[r] / f
			}
		}
	}
	return b
}


export const real = ([a,b]) =>
	a;

export const imag = ([a,b]) =>
	b;

export const addComp = ( ...args ) =>
	[ args.reduce( (a,z) => a + real(z), 0 ), args.reduce( (a,z) => a + imag(z), 0 ) ];

export const subComp = ( [a,b], [c,d] ) =>
	[ a-c, b-d ];

export const scaleComp = ( [a,b], s ) =>
	[ a*s, b*s ];

export const mulComp = ( [a,b], [c,d] ) =>
	[ a*c - b*d, a*d + b*c ];

export const mulComps = ( ...args ) =>
	args.reduce( (a,z) => mulComp( a, z ), [1,0] );

export const compConj = ([a,b]) =>
	[ a, -b ];

export const divComp = ( [a,b], [c,d] ) =>
	scaleComp( mulComp( [a,b], compConj([c,d]) ), 1 / real( mulComp([c,d], compConj([c,d])) ) );

export const negComp = ( [a,b] ) =>
	[-a, -b];


export function solveComp( Ac, bc ) {

	const Areal = Ac.map( row => row.map( real ) );
	const Aimag = Ac.map( row => row.map( imag ) );

	const A = [
		...Areal.map( (_,i) => [ ...Areal[i], ...Aimag[i].map( v => -v ) ] ),
		...Areal.map( (_,i) => [ ...Aimag[i], ...Areal[i]                ] ),
	];

	const breal = bc.map( real );
	const bimag = bc.map( imag );

	const b = [ ...breal, ...bimag ];

	const x = solve( A, b );

	const h = x.length / 2;
	return range(h).map( i => [ x[i], x[h+i] ] );
}

export function complexGaussianElimination( mat, x ) {

	const rows = mat.length;
	const cols = mat[0].length;

	if( rows != cols ) throw Error("No inverse, nonsquare matrix");

	let r, s, f, value, temp

	// make a copy of the matrix (only the arrays, not of the elements)
	const A = mat.map( row => row.map( z => z.map( v => v ) ) );

	// make a copy of the column vector x which will store the answer at the end
	const b = x.map( z => z.map( v => v ) );

	// loop over all columns, and perform row reductions
	for (let c = 0; c < cols; c++) {
		// Pivoting: Swap row c with row r, where row r contains the largest element A[r][c]
		let ABig = length( A[c][c] )
		let rBig = c
		r = c + 1
		while (r < rows) {
			if( length(A[r][c]) > ABig ) {
				ABig = length(A[r][c])
				rBig = r
			}
			r++
		}
		if (ABig < 1e-4) {
			throw Error('Cannot calculate inverse, determinant is zero')
		}
		r = rBig
		if (r !== c) {
			temp = A[c]; A[c] = A[r]; A[r] = temp
			temp = b[c]; b[c] = b[r]; b[r] = temp
		}

		// eliminate non-zero values on the other rows at column c
		const Ac = A[c]
		for (r = 0; r < rows; r++) {
			const Ar = A[r]
			if (r !== c) {
				// eliminate value at column c and row r
				if (Ar[c] !== 0) {
					f = negComp( divComp( Ar[c], Ac[c] ) );

					// add (f * row c) to row r to eliminate the value
					// at column c
					for (s = c; s < cols; s++) {
						Ar[s] = addComp( Ar[s], mulComp(f, Ac[s]) );
					}
					b[r] = addComp( b[r], mulComp(f, b[c]) );
				}
			} else {
				// normalize value at Acc to 1,
				// divide each value on row r with the value at Acc
				f = Ac[c];
				for (s = c; s < cols; s++) {
					Ar[s] = divComp( Ar[s], f );
				}
				b[r] = divComp( b[r], f );
			}
		}
	}
	return b
}

const Ac = 
[[ [1. ,+0.],  [ 1. ,+1.],   [0. ,+2.],   [0.4,+0.],   [0.4,+0.4], ],
 [ [1. ,+0.],  [ 1., -1.],   [0., -2.],   [0.4,+0.],   [0.4,-0.4], ],
 [ [1. ,+0.],  [-1., -1.],   [0. ,+2.],   [0. ,-2.],   [-2. ,+2.], ],
 [ [1. ,+0.],  [-1. ,+1.],   [0., -2.],   [0. ,+2.],   [-2.,-2.],  ],
 [ [1. ,+0.],  [ 0. ,+0.],   [0. ,+0.],   [0. ,+0.],   [0. ,+0.],  ]]

const bc = 
[[-0.2,0.2],
 [-0.2,-0.2],
 [-1., -1. ],
 [-1.,+1. ],
 [-0.3,0. ]];

console.log( complexGaussianElimination( Ac, bc ) )

