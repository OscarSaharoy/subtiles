// Oscar Saharoy 2023


function getVerts( tileSVG ) {
	
	const d = tileSVG.getAttribute("d");
	console.log( d );
	const commands = d.split( /[]/g );

	let p = [ 0, 0 ];


	const verts = [];

	return verts;
}

export class SVGTile {
	
	constructor( outerTileSVG, innerTileSVGs, verts ) {

		this.outerTileSVG  = outerTileSVG;
		this.innerTileSVGs = innerTileSVGs;

		this.tileSpaceVerts = getVerts( this.outerTileSVG );

		this.next = this.prev = null;
		this.verts = verts ?? this.tileSpaceVerts;
		this.depth = depth;
	}

	toSVG() {
		return `<path 
			d="${ utility.vertsToD(this.verts) }"
			fill="${ utility.depthToColour(this.depth) }"
			stroke="${ utility.depthToColour(this.depth+5) }"
		/>`;
	}
}

