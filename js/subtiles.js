// Oscar Saharoy 2023

const svg = document.querySelector( "svg" );


function vertsToD( verts ) {
	return verts.reduce( (acc,v,i) =>
		acc + `${i ? "L" : "M"} ${v[0]},${v[1]} `, ""
	) + "Z";
}

function connect( firstTile, secondTile ) {
	firstTile.next = secondTile;
	secondTile.prev = firstTile;
}

function connectArray( tiles ) {
	tiles.slice( 0, -1 ).forEach( (_,i) =>
		connect( tiles[i], tiles[i+1] )
	);
}

function getFirstLast( array ) {
	return [ array[0], array[array.length - 1] ];
}


class Tile {

	constructor() {
		this.verts = [ [0.25,0.25], [0.25,-0.25], [-0.25,-0.25], [-0.25,0.25] ];
		this.next = this.prev = null;
	}

	subdivide() {
		const tiles = [ new Tile(), new Tile() ];
		connectArray( tiles );
		return tiles;
	}

	toSVG() {

		return `<path 
			d="${ vertsToD(this.verts) }"
		/>`;
	}
}


class TileList {
	
	constructor( first = null ) {
		this.next = this.prev = first;
		first.prev = first.next = this;
	}

	subdivide() {
		
		let tile = this.next;

		while( tile != this ) {
			
			const subtiles = tile.subdivide();
			const [ firstSubtile, lastSubtile ] = getFirstLast( subtiles );

			connect( tile.prev, firstSubtile );
			connect( lastSubtile, tile.next );

			tile = tile.next;
		}
	}

	toSVG() {

		let tile = this.next;
		let svgStrings = [];

		while( tile != this ) {
			
			svgStrings.push( tile.toSVG() );
			tile = tile.next;
		}

		return svgStrings.join( "\n" );
	}
}

const rootTile = new Tile();
const tileList = new TileList( rootTile );

tileList.subdivide();
tileList.subdivide();
tileList.subdivide();

svg.innerHTML = tileList.toSVG();

