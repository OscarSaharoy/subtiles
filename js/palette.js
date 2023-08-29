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
	"tron": tron,
};

function wireframe( fingerprint ) {
	return [ "transparent", "black" ];
}

function rainbow( fingerprint ) {

	const hue = u.dot( fingerprint.centre, [1.2, 0.8] ) * 150;
	const saturation = Math.abs( u.dot( u.normalise(fingerprint.movement), [1,0] ) )**3 * 50 + 50;
	const lightness = 80 - saturation / 2.5;

	const fill = `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
	const stroke = "black";

	return [ fill, stroke ];
}

function tron( fingerprint ) {

	const hue = "190deg";
	const sat = "100%";
	const fillVal = `${ fingerprint.alternator*8 }%`;
	const strokeVal = `${ (fingerprint.alternator+5)*8 }%`;

	const fill = `hsl( ${hue} ${sat} ${fillVal} )`;
	const stroke = `hsl( ${hue} ${sat} ${strokeVal} )`;

	return [ fill, stroke ];
}

export let colourFunction = rainbow;

