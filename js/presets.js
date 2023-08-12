// Oscar Saharoy 2023

import { ingestSVGFile } from "./upload.js";
import { setThickness } from "./thickness.js";


const presetButton = document.getElementById( "preset" );
const presetOptions = [ ...presetButton.querySelectorAll( "p" ) ];

presetOptions.forEach( elm => 
	elm.onclick = () => fetchPreset( elm.textContent.trim() ) 
);


async function fetchPreset( filename ) {

	const response = await fetch( `presets/${filename}.svg` );
	const svgText = await response.text();
	ingestSVGFile( svgText, `${filename}.svg` );
	setThickness();
}

fetchPreset( "square" );

