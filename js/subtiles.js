// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { TwistTile } from "./Tile.js";


const fullSquare = [ [-1,-1], [1,-1], [1,1], [-1,1] ];
const rootTile = new TwistTile( fullSquare );

const tileList = new TileList( rootTile );
tileList.subdivide();
tileList.subdivide();
tileList.subdivide();

const svg = document.querySelector( "svg" );
svg.innerHTML = tileList.toSVG();

