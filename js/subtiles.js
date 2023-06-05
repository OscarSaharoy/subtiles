// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { RoseTile } from "./Tile.js";


const rootTile = new RoseTile();
const tileList = new TileList( rootTile );

const svg = document.querySelector( "svg" );

let i = 0;
while( ++i < 50 )
	tileList.subdivide();

svg.innerHTML = tileList.toSVG();

