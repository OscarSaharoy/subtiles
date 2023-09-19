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

const getHue = hslString =>
	+hslString.match( /(-?\d+)deg/ )?.[1] || 0;

function colourMap( hue ) {
	const lightness = 
		80 
		+ 20 * Math.sin( ( hue + 50 ) / 180 * Math.PI)
		- 890 / Math.sin( ( hue - 120 ) / 180 * Math.PI)
	;
	const saturation = 100;
	return `hsl( ${hue}deg, ${saturation}%, ${lightness}% )`;
}


function radial( fingerprint ) {
	
	const parentHue = fingerprint.parentFingerprint.hue ?? 0;
	
	let dot = 0;
	if( u.length(fingerprint.movement) > 1e-4 )
		dot += u.dot(
			u.normalise(fingerprint.cumulativeMovement),
			u.normalise(fingerprint.movement),
		);
	const dotsum =
		dot + (fingerprint.parentFingerprint.dotsum || 0);
	const hash = Math.sin( 12*dotsum );
	const randomHue = parentHue + hash * 180;

	const blendFactor = ( 1 - 1 / fingerprint.depth );
	const hue = Math.round(
		randomHue * (1-blendFactor) + parentHue * blendFactor
	);

	/*
	const fill   = `hsl( ${hue}deg, 100%, 80% )`;
	const stroke = `hsl( ${hue}deg, 100%, 80% )`;
	*/
	const fill = colourMap( hue );
	const stroke = fill;

	return { fill, stroke, hue, dotsum };
}

export const rootTileColourFunction = wireframe;
export let colourFunction = radial;

