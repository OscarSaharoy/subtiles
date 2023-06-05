// Oscar Saharoy 2023

const svg = document.querySelector( "svg" );


function vertsToD( verts ) {
	return verts.reduce( (acc,v,i) =>
		acc + `${i ? "L" : "M"} ${v[0]},${v[1]} `, ""
	) + "Z";
}


class Tile {

	constructor() {
		this.verts = [ [0.25,0.25], [0.25,-0.25], [-0.25,-0.25], [-0.25,0.25] ];
		this.next = this.prev = null;
	}

	subdivide() {
		const firstSubTile = new Tile();
		const lastSubTile = new Tile();

		firstSubTile.next = lastSubTile;
		lastSubTile.prev = firstSubTile;

		return [ firstSubTile, lastSubTile ];
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
			
			const [ firstSubTile, lastSubTile ] = tile.subdivide();

			firstSubTile.prev = tile.prev;
			tile.prev.next = firstSubTile;

			lastSubTile.next = tile.next;
			tile.next.prev = lastSubTile;

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

svg.innerHTML = tileList.toSVG();

