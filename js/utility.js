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

export function getFirstLast( array ) {
	return [ array[0], array[array.length - 1] ];
}

// returns true if points A B C are ordered counter clockwise
export const ccw = (A, B, C) =>
	(C[1]-A[1]) * (B[0]-A[0]) > (B[1]-A[1]) * (C[0]-A[0]);

// euclidian distance between A and B
export const dist = (A, B) =>
	length( sub( A, B ) );

// returns true if segA intersects segB
export const intersectSegments = (segA, segB) =>
	ccw(segA.start, segB.start, segB.end  ) != ccw(segA.end,   segB.start, segB.end) &&
	ccw(segA.start, segA.end,   segB.start) != ccw(segA.start, segA.end,   segB.end);

export const segment = (A, B) =>
	({ start: A, end: B });

export const add = (A, B) =>
	[ A[0] + B[0], A[1] + B[1] ];

export const sub = (A, B) =>
	[ A[0] - B[0], A[1] - B[1] ];

export const mul = (A, k) =>
	[ A[0] * k, A[1] * k ];

export const div = (A, k) =>
	[ A[0] / k, A[1] / k ];

export const length = (A) =>
	Math.sqrt( A[0]**2 + A[1]**2 );

export const normalise = (A) =>
	mul( A, 1/length(A) );

export const direction = (A, B) =>
	normalise( sub( B, A ) );	

export const dot = (A, B) =>
	A[0] * B[0] + A[1] * B[1];

export const back = (arr, offset = -1) =>
	arr[ arr.length + offset ]

export const commaSep = A =>
	`${A[0]},${A[1]}`;
