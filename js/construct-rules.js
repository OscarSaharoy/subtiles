// Oscar Saharoy 2023

import { infoLog, successLog, errorLog } from "./log.js"
import { getVerts, getTransforms } from "./parse-svg.js"


const containsPathsOnly = elm => [...elm.children].every( child => child.matches("path") );
const containsOneGroup  = elm => [...elm.children].filter( child => child.matches("g") ).length === 1;
const containsOnePath  = elm => [...elm.children].filter( child => child.matches("path") ).length === 1;
const containsOneOf = candidates => elm => candidates.filter( candidate => elm.contains(candidate) ).length === 1;


function getKeyAndSubdivisionRule( subdivisionOuterGroup ) {

	const innerGroup = subdivisionOuterGroup.querySelector( "g" );

	const outerGroupTransforms = getTransforms( subdivisionOuterGroup );
	const innerGroupTransforms = [ ...outerGroupTransforms, ...getTransforms( innerGroup ) ];

	const outerTileSVG  = subdivisionOuterGroup.querySelector( ":scope > path" );
	const innerTileSVGs = [ ...innerGroup.querySelectorAll( "path" ) ];

	const tileSpaceVerts = getVerts( outerTileSVG, outerGroupTransforms );
	const innerTileSpaceVerts = innerTileSVGs.map( tileSVG => getVerts(tileSVG, innerGroupTransforms) );

	const key = tileSpaceVerts.length;
	const value = { srcVerts: tileSpaceVerts, dstVertArray: innerTileSpaceVerts };

	return [ key, value ];
}


export function constructRules( svg, filename ) {

	infoLog(`Finding inner subdivision groups...`);

	const groups = [ ...svg.querySelectorAll( "g" ) ];
	const subdivisionInnerGroups = groups.filter( containsPathsOnly );

	successLog(`Found ${subdivisionInnerGroups.length} inner subdivision groups!`);
	infoLog(`Finding outer subdivision groups...`);

	const subdivisionOuterGroups = 
		groups
			.filter( containsOneGroup )
			.filter( containsOneOf(subdivisionInnerGroups) )
			.filter( containsOnePath );
	
	if( subdivisionInnerGroups.length !== subdivisionOuterGroups.length )
		return errorLog(`Error: found ${subdivisionOuterGroups.length} outer subdivision groups. ` +
					    `Did not find an outer subdivision group matching all the inner subdivision groups. ` +
						`Please check your input SVG file format!`);

	successLog(`Found ${subdivisionOuterGroups.length} outer subdivision groups!`);

	const keysAndSubdivisionRules = subdivisionOuterGroups.map( getKeyAndSubdivisionRule );
	const initialVertArrays = keysAndSubdivisionRules.map( ([, rule]) => rule.srcVerts );
	const subdivisionRuleMap = Object.fromEntries( keysAndSubdivisionRules );

	successLog(`Calculated subdivision rules!`);
	
	return [ initialVertArrays, subdivisionRuleMap ];
}

