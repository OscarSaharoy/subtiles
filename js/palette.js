// Oscar Saharoy 2023

import * as u from "./utility.js"
import { recolour } from "./subdivide.js";
import { darkMode } from "./dark-mode.js";
import { infoLog, showLog } from "./log.js";

const paletteButton = document.querySelector( "#palette" );
const paletteOptions = [ ...palette.querySelectorAll( ".options-list p" ) ];

paletteOptions.forEach( option => option.onclick =
	() => setColourFunction( option.textContent.trim() )
);

function setColourFunction( functionName ) {
	colourFunction = functionMap[ functionName ];
	infoLog(`Using colouring function: ${functionName}`);
	recolour();
}

const functionMap = {
	"wireframe": wireframe,
	"rainbow": rainbow,
	"tron": tron,
	"radial": radial,
};

function wireframe( fingerprint ) {
	const fill = "transparent";
	const stroke = darkMode ? "white" : "black";
	return { fill, stroke };
}

function rainbow( fingerprint ) {

	const hue = u.dot( fingerprint.centre, [1.2, 0.8] ) * 180;
	const saturation = Math.abs( u.dot( u.normalise(fingerprint.movement), [1,0] ) )**3 * 50 + 50;
	const lightness = 80 - saturation / 2.5;

	const fill = `hsl(${hue}deg, ${saturation}%, ${lightness}%)`;
	const stroke = darkMode ? "white" : "black";

	return { fill, stroke };
}

function tron( fingerprint ) {

	const hue = "190deg";
	const sat = "100%";
	const fillVal = `${ fingerprint.alternator*8 }%`;
	const strokeVal = `${ (fingerprint.alternator+5)*8 }%`;

	const fill = `hsl( ${hue} ${sat} ${fillVal} )`;
	const stroke = `hsl( ${hue} ${sat} ${strokeVal} )`;

	return { fill, stroke };
}

function radial( fingerprint ) {

	const colours = [
		"hsl(0deg, 100%, 80%)",
		"hsl(70deg, 100%, 80%)",
		"hsl(120deg, 100%, 80%)",
	];

	/*
	// 1
	let hash = 10*u.length( u.addVec(
		fingerprint.cumulativeMovement,
		u.normalise(fingerprint.movement),
	));
	*/

	// 2
	let hash = 5*u.dot(
		u.normalise(fingerprint.cumulativeMovement),
		u.normalise(fingerprint.movement),
	);
	if( u.length(fingerprint.movement) < 1e-4 )
		hash = 4;
	
/*
	const hueAngle = 360*hash;

	const hue = `${Math.round(hueAngle)}deg`;
	const sat = "100%";
	const fillVal = "80%";
	const strokeVal = "80%";

	const fill   = `hsl( ${hue} ${sat} ${fillVal} )`;
	const stroke = `hsl( ${hue} ${sat} ${strokeVal} )`;
	const style  = "paint-order: fill stroke;";
*/
	const i = ( ( Math.round(hash) % colours.length ) + colours.length ) % colours.length;
	const fill = colours[i];
	const stroke = fill;

	return { fill, stroke };
}

export const rootTileColourFunction = wireframe;
export let colourFunction = rainbow;

