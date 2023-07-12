// Oscar Saharoy 2023

import * as u from "./utility.js"
import { resetSubdivision } from "./upload.js";

const paletteButton = document.querySelector( "#palette" );
const paletteOptions = [ ...palette.querySelectorAll( ".options-list p" ) ];

paletteOptions.forEach( option => option.onclick =
	() => setColourFunction( option.textContent.trim() )
);

function setColourFunction( functionName ) {
	colourFunction = functionMap[ functionName ];
	resetSubdivision();
}

const functionMap = {
	"wireframe": wireframe,
	"rainbow": rainbow,
};

function wireframe( fingerprint ) {
	return "transparent";
}

function rainbow( fingerprint ) {

	if( fingerprint.depth == 0 )
		return "white";

	const hue = u.dot( fingerprint.centre, [1,1] ) * 100;
	const saturation = Math.abs( u.dot( u.normalise(fingerprint.movement), [1,0] ) )**3 * 50 + 50;
	const lightness = 80 - saturation / 2.5;

	return `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
}

export let colourFunction = rainbow;

