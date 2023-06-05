// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { HalvingTile } from "./Tile.js";


const rootTile = new HalvingTile( HalvingTile.tileSpaceVerts );
const tileList = new TileList( rootTile );

const svg = document.querySelector( "svg" );

let i = 0;
while( ++i < 20 )
	tileList.subdivide();

svg.innerHTML = tileList.toSVG();

