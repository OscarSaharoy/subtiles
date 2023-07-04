// Oscar Saharoy 2023

import { resetSubdivision } from "./upload.js";
import { affineTileMap } from "./affine-map.js";
import { conformalTileMap } from "./conformal-map.js";


export let tileMappingFunction = affineTileMap;

const mappingButton = document.getElementById( "mapping" );
const mappingOptions = [ ...mappingButton.querySelectorAll( "p" ) ];

mappingOptions.forEach( elm => 
	elm.onclick = () => setMapping( elm.textContent.trim().toLowerCase() ) 
);


const mapMap = {
	"affine": affineTileMap,
	"conformal": conformalTileMap,
};

async function setMapping( option ) {

	tileMappingFunction = mapMap[option];
	resetSubdivision();
}

