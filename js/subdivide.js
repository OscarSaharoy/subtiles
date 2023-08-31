// Oscar Saharoy 2023

import { infoLog, successLog } from "./log.js";
import { TileList } from "./TileList.js";
import { SVGTile } from "./SVGTile.js";
import { setThickness } from "./thickness.js";
import { constructRules } from "./construct-rules.js";


const countSpan = document.querySelector( "span#count" );
const plusButton = document.getElementById( "plus" );
const minusButton = document.getElementById( "minus" );

plusButton.addEventListener( "click", plus );
minusButton.addEventListener( "click", minus );

export let divisionDepth = 0;
export const resetDivisionDepth = () => divisionDepth = 0;

export let svg = document.querySelector( "main svg" );
const uploadInput = document.getElementById( "upload-input" );

const reader = new FileReader();

window.addEventListener( "keydown",
	e => e.key == "o" && uploadInput.click() );
uploadInput.addEventListener( "change",
	e => reader.readAsText( uploadInput.files[0] ) );
reader.addEventListener( "load", 
	e => ingestSVGFile( reader.result, uploadInput.files[0].name ) );


export let tileList = null;
export let svgCache = {};
let importedFileCache = { svgText: undefined, filename: undefined };


export function plus() {
	const startTime = performance.now();

	++divisionDepth;

	if( divisionDepth in svgCache )
		svg.innerHTML = svgCache[ divisionDepth ];
	
	else
		svgCache[ divisionDepth ] = svg.innerHTML = tileList.subdivide().toSVG();

	updateSubtilesCount();

	const secondsTaken = Math.ceil( performance.now() - startTime );
	infoLog(`Calculated subdivision level ${divisionDepth} in ${secondsTaken}ms`);
}

function minus() {
	const startTime = performance.now();

	divisionDepth = Math.max( 0, divisionDepth - 1 );

	svg.innerHTML = svgCache[ divisionDepth ];
	updateSubtilesCount();

	const secondsTaken = Math.ceil( performance.now() - startTime );
	infoLog(`Calculated subdivision level ${divisionDepth} in ${secondsTaken}ms`);
}

function updateSubtilesCount() {
	const count = svg.innerHTML.split("\n").length;
	const sub   = divisionDepth === 0 ? "" : "sub";
	const label = count === 1 ? "tile" : "tiles";
	countSpan.innerHTML = `${count} ${sub}${label}`;
}

export function ingestSVGFile( svgText, filename ) {

	infoLog(`Resetting subtiles state`);

	importedFileCache = { svgText, filename };

	tileList = null;
	svgCache = {};
	resetDivisionDepth();

	infoLog(`Importing SVG file...`);

	svg.outerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	svg = document.querySelector( "main svg" );
	svg.removeAttribute( "width"  );
	svg.removeAttribute( "height" );
	setThickness();

	successLog(`Imported ${filename}`);

	const [ initialVertArrays, subdivisionRules ] = constructRules( svg, filename );

	const initialTiles = initialVertArrays.map( verts => new SVGTile( verts ) );
	tileList = new TileList( initialTiles, subdivisionRules );
	svgCache[0] = tileList.toSVG();

	plus();
}

export function resetSubdivision() {
	
	infoLog(`Resetting subdivision`);
	ingestSVGFile( importedFileCache.svgText, importedFileCache.filename );
}

