// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { Tile } from "./Tile.js";


const rootTile = new Tile();
const tileList = new TileList( rootTile );

tileList.subdivide();
tileList.subdivide();
tileList.subdivide();


const svg = document.querySelector( "svg" );
svg.innerHTML = tileList.toSVG();

