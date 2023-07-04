// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { SVGTile } from "./SVGTile.js";
import { divisionDepth, resetDivisionDepth } from "./subdivide.js";


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

export function constructRules( svgText ) {

	tileList = null;
	svgCache = {};
	resetDivisionDepth();

	svg.outerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	
	svg = document.querySelector( "svg" );
	const outerGroup = svg.querySelector( "g" );
	const innerGroup = outerGroup.querySelector( "g" );

	const outerTile = outerGroup.querySelector( ":scope > path" );
	const innerTiles = [ ...innerGroup.querySelectorAll( "path" ) ];

	const rootTile = new SVGTile( outerTile, innerTiles );
	tileList = new TileList( rootTile );

	svgCache[0] = tileList.toSVG();

	tileList.subdivide();
	svgCache[ divisionDepth ] = svg.innerHTML = tileList.toSVG();

	svg.removeAttribute( "width"  );
	svg.removeAttribute( "height" );
}
