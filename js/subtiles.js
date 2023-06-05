// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { DiamondTile } from "./Tile.js";


const rootTile = new DiamondTile();
const tileList = new TileList( rootTile );

const svg = document.querySelector( "svg" );

let i = 0;
while( i++ < 4 )
	tileList.subdivide();

svg.innerHTML = tileList.toSVG();

