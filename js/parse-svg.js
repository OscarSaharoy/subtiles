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

	const pathTransforms = getTransforms( tileSVG );
	transforms = [ ...transforms, ...pathTransforms ];
	
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
			const transformedPoint = transforms.toReversed().reduce(
				(reducerPoint, transform) => applyTransform( reducerPoint, transform ), p );
			verts.push( transformedPoint );

			commandType = subsequentCommandMap[ commandType ];
		}
	}

	if( !u.vertsAreClockwise( verts ) ) verts.reverse();

	return verts;
}

const parseParams = string => string?.split( /[, ]+/g ).map( x => +x );

const makeTransformObj = ([ _, transformType, params ], transformOrigin) =>
	({ type: transformType,
	   params: parseParams(params),
	   origin: ( transformType === "rotate" && parseParams(params).length === 3 ) ? [0, 0] : transformOrigin });

const parseTransformString = (transformString, transformOrigin) =>
	[ ...transformString.matchAll( /(\w+)\((.*?)\)/g ) ]
		.map( match => makeTransformObj(match, transformOrigin) )

export const getTransforms = svg =>
	parseTransformString(
		svg.getAttribute( "transform" ) ?? "",
		parseParams( svg.getAttribute( "transform-origin" ) ) || [0,0],
	);

const transformMatrixMap = {

	"matrix": params =>
		u.transpose([
			params.slice(0, 2),
			params.slice(2, 4),
			params.slice(4, 6),
		]),
	
	"translate": params => [
			[1, 0, params[0]],
			[0, 1, params[1] || 0],
		],

	"scale": params => [
			[ params[0], 0, 0 ],
			[ 0, params[1] || params[0], 0 ],
		],

	"rotate": params => [
			[ u.cosD(params[0]), -u.sinD(params[0]), -u.cosD(params[0]) * (params[1] ?? 0) + u.sinD(params[0]) * (params[2] ?? 0) + (params[1] ?? 0) ],
			[ u.sinD(params[0]),  u.cosD(params[0]), -u.sinD(params[0]) * (params[1] ?? 0) - u.cosD(params[0]) * (params[2] ?? 0) + (params[2] ?? 0) ],
		],

	"skewX": params => [
			[1, 0, 0],
			[0, 1, 0],
		],

	"skewY": params => [
			[1, 0, 0],
			[0, 1, 0],
		],
};

const applyTransform = ( point, transform ) =>	
	u.addVec( 
		transform.origin,
		u.matVecMul(
			transformMatrixMap[transform.type](transform.params),
			[ ...u.subVec( point, transform.origin ), 1 ],
		)
	);

