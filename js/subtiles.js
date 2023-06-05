// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { TestTile } from "./Tile.js";


const rootTile = new TestTile();
const tileList = new TileList( rootTile );

const svg = document.querySelector( "svg" );

let i = 0;
while( ++i < 5 )
	tileList.subdivide();

svg.innerHTML = tileList.toSVG();

