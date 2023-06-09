// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { DiamondTile } from "./Tile.js";
import { SVGTile } from "./SVGTile.js";


let svg = document.querySelector( "svg" );
const uploadInput = document.getElementById( "upload-input" );

const reader = new FileReader();

window.addEventListener( "keydown",
	e => e.key == "o" && uploadInput.click() );
uploadInput.addEventListener( "change",
	e => reader.readAsText( uploadInput.files[0] ) );
reader.addEventListener( "load", 
	e => constructRules( reader.result ) );


function constructRules( svgText ) {

	svg.outerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	
	svg = document.querySelector( "svg" );
	const outerGroup = svg.querySelector( "g" );
	const innerGroup = outerGroup.querySelector( "g" );

	const outerTile = outerGroup.querySelector( ":scope > path" );
	const innerTiles = [ ...innerGroup.querySelectorAll( "path" ) ];

	console.log( outerTile, innerTiles );

	const rootTile = new SVGTile( outerTile, innerTiles );
	const tileList = new TileList( rootTile );

	let i = 0;
	while( i++ < 4 )
		tileList.subdivide();

	svg.innerHTML = tileList.toSVG();
}


const rootTile = new DiamondTile();
const tileList = new TileList( rootTile );

let i = 0;
while( i++ < 4 )
	tileList.subdivide();

svg.innerHTML = tileList.toSVG();

