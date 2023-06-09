// Oscar Saharoy 2023

import * as utility from "./utility.js";


const pathCommandMap = {
	M: (p, [x, y]) => [x, y],
	m: (p, [dx, dy]) => utility.addVec( p, [dx, dy] ),
	L: (p, [x, y]) => [x, y],
	l: (p, [dx, dy]) => utility.addVec( p, [dx, dy] ),
	H: (p, [x]) => [ x, p[1] ],
	h: (p, [dx]) => utility.addVec( p, [dx, 0] ),
	V: (p, [y]) => [ p[0], y ],
	v: (p, [dy]) => utility.addVec( p, [0, dy] ),
};

const commandArgCountMap = {
	M: 2,
	m: 2,
	L: 2,
	l: 2,
	H: 1,
	h: 1,
	V: 1,
	v: 1,
};

const subsequentCommandMap = {
	M: "L",
	m: "m",
	L: "L",
	l: "l",
	H: "H",
	h: "h",
	V: "V",
	v: "v",
};


function getVerts( tileSVG ) {
	
	const d = tileSVG.getAttribute("d");
	const letterSeperated = d.match( /([MmLlHhVvCcSsQqTtAa])([-\de\., ]*)/g );

	let p = [ 0, 0 ];
	const verts = [];

	for( const group of letterSeperated ) {

		let commandType = group.match( /[MmLlHhVvCcSsQqTtAa]/ )[0];
		let args = group.match( /([MmLlHhVvCcSsQqTtAa])([-\de\., ]*)/ )[2]
			.split( /[, ]+/ )
			.filter( s => s.length )
			.map( s => +s );

		while( args.length > 0 ) {

			const argsRequired = commandArgCountMap[ commandType ];
			const currentArgs = args.splice( 0, argsRequired );

			p = pathCommandMap[commandType]( p, currentArgs );
			verts.push( p );

			commandType = subsequentCommandMap[ commandType ];
		}
	}

	return verts;
}


export class SVGTile {
	
	constructor( outerTileSVG, innerTileSVGs, verts ) {

		this.outerTileSVG  = outerTileSVG;
		this.innerTileSVGs = innerTileSVGs;

		this.tileSpaceVerts = getVerts( this.outerTileSVG );
		this.innerTileSpaceVerts = innerTileSVGs.map( getVerts );

		this.next = this.prev = null;
		this.verts = verts ?? this.tileSpaceVerts;
	}

	subdivide() {

		const newTiles = this.innerTileSpaceVerts.map( vertArray =>
			new SVGTile( this.outerTileSVG, this.innerTileSVGs, vertArray )
		);

		const subtiles = utility.mapTilesFromTileSpace( newTiles, this );
		return utility.connectArray( subtiles );
	}

	toSVG() {
		return `<path 
			d="${ utility.vertsToD(this.verts) }"
		/>`;
	}
}

