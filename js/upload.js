// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { SVGTile } from "./SVGTile.js";
import { plus, divisionDepth, resetDivisionDepth } from "./subdivide.js";
import { infoLog, successLog } from "./log.js"
import { setThickness } from "./thickness.js";
import { constructRules } from "./construct-rules.js";


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

