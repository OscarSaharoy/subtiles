// Oscar Saharoy 2023

import { infoLog, successLog } from "./log.js";
import { TileTree } from "./TileTree.js";
import { SVGTile } from "./SVGTile.js";
import { setThickness, getThickness } from "./thickness.js";
import { constructRules } from "./construct-rules.js";


const countSpan = document.querySelector( "span#count" );
const plusButton = document.getElementById( "plus" );
const minusButton = document.getElementById( "minus" );
const uploadInput = document.getElementById( "upload-input" );
export let svg = document.querySelector( "main svg" );

const reader = new FileReader();

window.addEventListener( "keydown", e => e.key == "o" && uploadInput.click() );
uploadInput.addEventListener( "change", e => reader.readAsText( uploadInput.files[0] ) );
reader.addEventListener( "load", e => ingestSVGFile( reader.result, uploadInput.files[0].name ) );

plusButton.addEventListener( "click", plus );
minusButton.addEventListener( "click", minus );

export let tileTree = null;
export let subdivisionDepth = 0;
let importedFileCache = { svgText: undefined, filename: undefined };

export const recolour = () => tileTree.recolour();

export function ingestSVGFile( svgText, filename ) {

	infoLog(`Resetting subtiles state`);

	importedFileCache = { svgText, filename };

	tileTree = null;
	subdivisionDepth = 0;

	infoLog(`Importing SVG file...`);

	svg.outerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	svg = document.querySelector( "main svg" );
	svg.removeAttribute( "width"  );
	svg.removeAttribute( "height" );
	setThickness();

	successLog(`Imported ${filename}`);

	const [ initialVertArrays, subdivisionRules ] = constructRules( svg, filename );
	svg.innerHTML = "";

	const initialTiles = initialVertArrays.map( verts => new SVGTile( verts ) );
	tileTree = new TileTree( initialTiles, subdivisionRules );

	plus();
}


function plus() {
	const startTime = performance.now();

	++subdivisionDepth;

	tileTree.subdivide(svg);
	updateSubtilesCount();

	const millisecondsTaken = Math.ceil( performance.now() - startTime );
	infoLog(`Calculated subdivision level ${subdivisionDepth} in ${millisecondsTaken}ms`);
}

function minus() {
	if( subdivisionDepth === 0 ) return;

	const startTime = performance.now();

	--subdivisionDepth;

	tileTree.unsubdivide(svg);
	updateSubtilesCount();

	const millisecondsTaken = Math.ceil( performance.now() - startTime );
	infoLog(`Calculated subdivision level ${subdivisionDepth} in ${millisecondsTaken}ms`);
}

export function updateSubtilesCount() {
	const count = svg.childElementCount;
	const sub   = subdivisionDepth === 0 ? "" : "sub";
	const label = count === 1 ? "tile" : "tiles";
	countSpan.innerHTML = `${count} ${sub}${label}`;
}

export function resetSubdivision() {
	
	infoLog(`Resetting subdivision`);
	ingestSVGFile( importedFileCache.svgText, importedFileCache.filename );
}

