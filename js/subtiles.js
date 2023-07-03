// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { DiamondTile } from "./Tile.js";
import { SVGTile } from "./SVGTile.js";


let svg = document.querySelector( "svg" );
const uploadInput = document.getElementById( "upload-input" );
const plusButton = document.getElementById( "plus" );
const minusButton = document.getElementById( "minus" );

const reader = new FileReader();

window.addEventListener( "keydown",
	e => e.key == "o" && uploadInput.click() );
uploadInput.addEventListener( "change",
	e => reader.readAsText( uploadInput.files[0] ) );
reader.addEventListener( "load", 
	e => constructRules( reader.result ) );
plusButton.addEventListener( "click", plus );
minusButton.addEventListener( "click", minus );


let tileList = null;
let svgCache = {};
let divisionDepth = 1;

function constructRules( svgText ) {

	tileList = null;
	svgCache = {};
	divisionDepth = 1;

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

function plus() {

	++divisionDepth;

	if( divisionDepth in svgCache )
		svg.innerHTML = svgCache[ divisionDepth ];
	
	else
		svgCache[ divisionDepth ] = svg.innerHTML = tileList.subdivide().toSVG();
}

function minus() {

	divisionDepth = Math.max( 0, divisionDepth - 1 );
	svg.innerHTML = svgCache[ divisionDepth ];
}


async function fetchPreset( filename ) {

	const response = await fetch( "/templates/subtiles1.svg" );
	const svgText = await response.text();
	constructRules( svgText );
}
fetchPreset();

