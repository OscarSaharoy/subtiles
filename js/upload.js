// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { SVGTile } from "./SVGTile.js";
import { divisionDepth, resetDivisionDepth } from "./subdivide.js";
import { getVerts } from "./parse-svg.js"


export let svg = document.querySelector( "svg" );
const uploadInput = document.getElementById( "upload-input" );

const reader = new FileReader();

window.addEventListener( "keydown",
	e => e.key == "o" && uploadInput.click() );
uploadInput.addEventListener( "change",
	e => reader.readAsText( uploadInput.files[0] ) );
reader.addEventListener( "load", 
	e => constructRules( reader.result ) );


export let tileList = null;
export let svgCache = {};
let svgTextCache = null;

export function constructRules( svgText ) {

	svgTextCache = svgText;

	tileList = null;
	svgCache = {};
	resetDivisionDepth();

	svg.outerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	
	svg = document.querySelector( "svg" );
	const outerGroup = svg.querySelector( "g" );
	const innerGroup = outerGroup.querySelector( "g" );

	const outerTileSVG  = outerGroup.querySelector( ":scope > path" );
	const innerTileSVGs = [ ...innerGroup.querySelectorAll( "path" ) ];

	const tileSpaceVerts = getVerts( outerTileSVG );
	const innerTileSpaceVerts = innerTileSVGs.map( getVerts );

	const subdivisionRules = { "*": { srcVerts: tileSpaceVerts, dstVertArray: innerTileSpaceVerts } };

	const rootTile = new SVGTile( tileSpaceVerts );
	tileList = new TileList( rootTile, subdivisionRules );

	svgCache[0] = tileList.toSVG();

	tileList.subdivide();
	svgCache[ divisionDepth ] = svg.innerHTML = tileList.toSVG();

	svg.removeAttribute( "width"  );
	svg.removeAttribute( "height" );
}

export function resetSubdivision() {
	
	constructRules( svgTextCache );
}

