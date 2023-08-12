// Oscar Saharoy 2023

import { TileList } from "./TileList.js";
import { SVGTile } from "./SVGTile.js";
import { plus, divisionDepth, resetDivisionDepth } from "./subdivide.js";
import { getVerts, getTransforms } from "./parse-svg.js"
import { infoLog, successLog, errorLog } from "./log.js"
import { setThickness } from "./thickness.js";


export let svg = document.querySelector( "#container > svg" );
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


export function constructRules( svgText ) {

	svg.outerHTML = svgText.match( /<\s*svg.*?>(.*)<\/\s*svg.*?>/is )[0];
	svg = document.querySelector( "#container > svg" );
	svg.removeAttribute( "width"  );
	svg.removeAttribute( "height" );
	setThickness();

	infoLog(`Finding file groups`);
	
	const outerGroup = svg.querySelector( "g" );
	const innerGroup = outerGroup.querySelector( "g" );

	// now handle multiple outer and inner groups!!!!
	const outerGroupTransforms = getTransforms( outerGroup );
	const innerGroupTransforms = [ ...outerGroupTransforms, ...getTransforms( innerGroup ) ];

	const outerTileSVG  = outerGroup.querySelector( ":scope > path" );
	const innerTileSVGs = [ ...innerGroup.querySelectorAll( "path" ) ];

	const tileSpaceVerts = getVerts( outerTileSVG, outerGroupTransforms );
	const innerTileSpaceVerts = innerTileSVGs.map( tileSVG => getVerts(tileSVG, innerGroupTransforms) );

	const subdivisionRules = { "*": { srcVerts: tileSpaceVerts, dstVertArray: innerTileSpaceVerts } };
	return [ tileSpaceVerts, subdivisionRules ];
}


export function ingestSVGFile( svgText, filename ) {

	infoLog(`Resetting subtiles state`);

	importedFileCache = { svgText, filename };

	tileList = null;
	svgCache = {};
	resetDivisionDepth();

	successLog(`Importing ${filename}`);

	const [ tileSpaceVerts, subdivisionRules ] = constructRules( svgText );

	successLog(`Calculated subdivision rules`);

	const rootTile = new SVGTile( tileSpaceVerts );
	tileList = new TileList( rootTile, subdivisionRules );
	svgCache[0] = tileList.toSVG();

	plus();
}

export function resetSubdivision() {
	
	infoLog(`Resetting subdivision`);
	ingestSVGFile( importedFileCache.svgText, importedFileCache.filename );
}

