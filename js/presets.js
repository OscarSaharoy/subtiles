// Oscar Saharoy 2023

import { constructRules } from "./upload.js";


async function fetchPreset( filename ) {

	const response = await fetch( "/templates/subtiles1.svg" );
	const svgText = await response.text();
	constructRules( svgText );
}
fetchPreset();

