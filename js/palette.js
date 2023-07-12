// Oscar Saharoy 2023

import * as u from "./utility.js"

const paletteButton = document.querySelector( "#palette" );

const functionMap = {
	"rainbow": rainbow,
};

function rainbow( fingerprint ) {

	if( fingerprint.depth == 0 )
		return "white";

	const hue = u.dot( fingerprint.centre, [1,1] ) * 100;
	const saturation = Math.abs( u.dot( u.normalise(fingerprint.movement), [1,0] ) )**3 * 50 + 50;
	const lightness = 80 - saturation / 2.5;

	return `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
}

export let colourFunction = rainbow;

