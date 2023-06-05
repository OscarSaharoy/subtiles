// Oscar Saharoy 2023

class Tile {
	constructor() {
		this.verts = [ [0.25,0.25], [0.25,-0.25], [-0.25,-0.25], [-0.25,0.25] ];
	}

	toSVG() {

		return `<path d="
			${ vertsToD(this.verts) }
		" />`;
	}
}
