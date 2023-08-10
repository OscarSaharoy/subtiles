// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { SVGTile } from "./SVGTile.js";
import { plus, divisionDepth, resetDivisionDepth } from "./subdivide.js";
import { getVerts, getTransforms } from "./parse-svg.js"


export const svg = document.querySelector( "svg" );
const uploadInput = document.getElementById( "upload-input" );

const reader = new FileReader();

window.addEventListener( "keydown",
	e => e.key == "o" && uploadInput.click() );
uploadInput.addEventListener( "change",
	e => reader.readAsText( uploadInput.files[0] ) );
reader.addEventListener( "load", 
	e => ingestSVGFile( reader.result ) );


export let tileList = null;
export let svgCache = {};
let svgTextCache = null;


export function constructRules( svgText ) {

	const shadowSVGContainer = document.createElement( "div" );
	shadowSVGContainer.innerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	
	const outerGroup = shadowSVGContainer.querySelector( "g" );
	const innerGroup = outerGroup.querySelector( "g" );

	// now handle multiple outer and inner groups!!!!
	const outerGroupTransforms = getTransforms( outerGroup );
	const innerGroupTransforms = [ ...outerGroupTransforms, ...getTransforms( innerGroup ) ];

	const outerTileSVG  = outerGroup.querySelector( ":scope > path" );
	const innerTileSVGs = [ ...innerGroup.querySelectorAll( "path" ) ];

	const tileSpaceVerts = getVerts( outerTileSVG, outerGroupTransforms );
	const innerTileSpaceVerts = innerTileSVGs.map( tileSVG => getVerts(tileSVG, innerGroupTransforms) );

	const subdivisionRules = { "*": { srcVerts: tileSpaceVerts, dstVertArray: innerTileSpaceVerts } };
	return [ tileSpaceVerts, subdivisionRules ];
}


export function ingestSVGFile( svgText ) {

	svgTextCache = svgText;

	tileList = null;
	svgCache = {};
	resetDivisionDepth();

	const [ tileSpaceVerts, subdivisionRules ] = constructRules( svgText );

	const rootTile = new SVGTile( tileSpaceVerts );
	tileList = new TileList( rootTile, subdivisionRules );
	svgCache[0] = tileList.toSVG();
	plus();
}

export function resetSubdivision() {
	
	ingestSVGFile( svgTextCache );
}

