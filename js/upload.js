// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { SVGTile } from "./SVGTile.js";
import { plus, divisionDepth, resetDivisionDepth } from "./subdivide.js";
import { getVerts, getTransforms } from "./parse-svg.js"
import { infoLog, successLog, errorLog } from "./log.js"
import { setThickness } from "./thickness.js";


export let svg = document.querySelector( "main svg" );
const uploadInput = document.getElementById( "upload-input" );

const reader = new FileReader();

window.addEventListener( "keydown",
	e => e.key == "o" && uploadInput.click() );
uploadInput.addEventListener( "change",
	e => reader.readAsText( uploadInput.files[0] ) );
reader.addEventListener( "load", 
	e => ingestSVGFile( reader.result, uploadInput.files[0].name ) );


export let tileList = null;
export let svgCache = {};
let importedFileCache = { svgText: undefined, filename: undefined };

const containsPathsOnly = elm => [...elm.children].every( child => child.matches("path") );
const containsOneGroup  = elm => [...elm.children].filter( child => child.matches("g") ).length === 1;
const containsOnePath  = elm => [...elm.children].filter( child => child.matches("path") ).length === 1;
const containsOneOf = candidates => elm => candidates.filter( candidate => elm.contains(candidate) ).length === 1;


function makeSubdivisionRule( subdivisionOuterGroup ) {

	const innerGroup = subdivisionOuterGroup.querySelector( "g" );

	// now handle multiple outer and inner groups!!!!
	const outerGroupTransforms = getTransforms( subdivisionOuterGroup );
	const innerGroupTransforms = [ ...outerGroupTransforms, ...getTransforms( innerGroup ) ];

	const outerTileSVG  = subdivisionOuterGroup.querySelector( ":scope > path" );
	const innerTileSVGs = [ ...innerGroup.querySelectorAll( "path" ) ];

	const tileSpaceVerts = getVerts( outerTileSVG, outerGroupTransforms );
	const innerTileSpaceVerts = innerTileSVGs.map( tileSVG => getVerts(tileSVG, innerGroupTransforms) );

	const key = "*";
	const value = { srcVerts: tileSpaceVerts, dstVertArray: innerTileSpaceVerts };

	return [ key, value ];
}


export function constructRules( svgText, filename ) {

	infoLog(`Importing SVG file...`);

	svg.outerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	svg = document.querySelector( "main svg" );
	svg.removeAttribute( "width"  );
	svg.removeAttribute( "height" );
	setThickness();

	successLog(`Imported ${filename}`);
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

	successLog(`Found ${subdivisionOuterGroups.length} outer subdivision groups!`);

	const keysAndSubdivisionRules = subdivisionOuterGroups.map( makeSubdivisionRule );
	const initialVertArrays = keysAndSubdivisionRules.map( ([, rule]) => rule.srcVerts );
	const subdivisionRuleMap = Object.fromEntries( keysAndSubdivisionRules );
	
	return [ initialVertArrays, subdivisionRuleMap ];
}


export function ingestSVGFile( svgText, filename ) {

	infoLog(`Resetting subtiles state`);

	importedFileCache = { svgText, filename };

	tileList = null;
	svgCache = {};
	resetDivisionDepth();

	const [ initialVertArrays, subdivisionRules ] = constructRules( svgText, filename );

	successLog(`Calculated subdivision rules!`);

	const initialTiles = initialVertArrays.map( verts => new SVGTile( verts ) );
	tileList = new TileList( initialTiles, subdivisionRules );
	svgCache[0] = tileList.toSVG();

	plus();
}

export function resetSubdivision() {
	
	infoLog(`Resetting subdivision`);
	ingestSVGFile( importedFileCache.svgText, importedFileCache.filename );
}

