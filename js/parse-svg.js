// Oscar Saharoy 2023

import * as u from "./utility.js";


const pathCommandMap = {
	M: (p, x, y) => [x, y],
	m: (p, dx, dy) => u.addVec( p, [dx, dy] ),
	L: (p, x, y) => [x, y],
	l: (p, dx, dy) => u.addVec( p, [dx, dy] ),
	H: (p, x) => [ x, p[1] ],
	h: (p, dx) => u.addVec( p, [dx, 0] ),
	V: (p, y) => [ p[0], y ],
	v: (p, dy) => u.addVec( p, [0, dy] ),
	C: (p, x1, y1, x2, y2, x, y) => [ x, y ],
	c: (p, dx1, dy1, dx2, dy2, dx, dy) => u.addVec( p, [dx, dy] ),
	S: (p, x2, y2, x, y) => [ x, y ],
	s: (p, dx2, dy2, dx, dy) => u.addVec( p, [ dx, dy ] ),
	Q: (p, x1, y1, x, y) => [ x, y ],
	q: (p, dx1, dy1, dx, dy) => u.addVec( p, [ dx, dy ] ),
	T: (p, x, y) => [ x, y ],
	t: (p, dx, dy) => u.addVec( p, [ dx, dy ] ),
	A: (p, rx, ry, angle, largeArgFlag, sweepFlag, x, y) => [ x, y ],
	a: (p, rx, ry, angle, largeArgFlag, sweepFlag, dx, dy) => u.addVec( p, [ dx, dy ] ),
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

export function getVerts( tileSVG, transforms=[] ) {

	const pathTransform = getTransform( tileSVG );
	transforms.push( pathTransform );
	
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

			const argsRequired = pathCommandMap[ commandType ].length - 1;
			const currentArgs = args.splice( 0, argsRequired );

			p = pathCommandMap[commandType]( p, ...currentArgs );
			const transformedPoint = transforms
				.reduce( (reducerPoint, transformParams) => applyTransform( reducerPoint, transformParams ), p );
			verts.push( transformedPoint );

			commandType = subsequentCommandMap[ commandType ];
		}
	}

	if( !u.vertsAreClockwise( verts ) ) verts.reverse();

	return verts;
}


const getParamArgs = (string, param) =>
	string?.match( new RegExp(`${param}\\((.*?)\\)`) )?.[1]
		.split(",").map( x => +x )

export function getTransform( svg ) {

	const transformString = svg.getAttribute( "transform" );

	const transformParams = {};
	[ "matrix", "translate", "scale", "rotate", "skewX", "skewY" ]
		.forEach( param => transformParams[param] = getParamArgs(transformString, param) );

	return transformParams;
}

function applyTransform( point, transformParams ) {

	let transformedPoint = point;

	if( transformParams.matrix ) {

		const transformMatrix = u.transpose([
			transformParams.matrix.slice(0, 2),
			transformParams.matrix.slice(2, 4),
			transformParams.matrix.slice(4, 6),
		]);

		transformedPoint = u.matVecMul( transformMatrix, [...transformedPoint, 1] );
	}

	return transformedPoint;
}

