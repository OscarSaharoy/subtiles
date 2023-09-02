// Oscar Saharoy 2023

import { resetSubdivision } from "./subdivide.js";
import { affineTileMap } from "./affine-map.js";
import { conformalTileMap } from "./conformal-map.js";
import { procrustesTileMap } from "./procrustes-map.js";
import { infoLog } from "./log.js";


export let tileMappingFunction = affineTileMap;

const mappingButton = document.getElementById( "mapping" );
const mappingOptions = [ ...mappingButton.querySelectorAll( "p" ) ];

mappingOptions.forEach( elm => 
	elm.onclick = () => setMapping( elm.textContent.trim().toLowerCase() ) 
);


const mapMap = {
	"affine": affineTileMap,
	"conformal": conformalTileMap,
	"procrustes": procrustesTileMap,
};

function setMapping( option ) {

	tileMappingFunction = mapMap[option];
	infoLog(`Using mapping function: ${option}`);
	resetSubdivision();
}

