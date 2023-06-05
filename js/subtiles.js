// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { TwistTile } from "./Tile.js";


const rootTile = new TwistTile( TwistTile.tileSpaceVerts );
const tileList = new TileList( rootTile );

const svg = document.querySelector( "svg" );
let i = 0;

( function loop() {

	if( ++i < 200 ) requestAnimationFrame( loop );
	
	tileList.subdivide();
	svg.innerHTML = tileList.toSVG();

} )();

