// Oscar Saharoy 2023

export function vertsToD( verts ) {
	return verts.reduce( (acc,v,i) =>
		acc + `${i ? "L" : "M"} ${v[0]},${v[1]} `, ""
	) + "Z";
}

export function connect( firstTile, secondTile ) {
	firstTile.next = secondTile;
	secondTile.prev = firstTile;
}

export function connectArray( tiles ) {
	tiles.slice( 0, -1 ).forEach( (_,i) =>
		connect( tiles[i], tiles[i+1] )
	);
}

export function getFirstLast( array ) {
	return [ array[0], array[array.length - 1] ];
}
