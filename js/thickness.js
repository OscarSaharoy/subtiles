// Oscar Saharoy 2023

import { parseParams } from "./parse-svg.js";

const thicknessSlider = document.querySelector( "#thickness input" );

thicknessSlider.addEventListener( "input", e => setThickness( e.target.value ) );

const svgRule = Array.prototype.find.call( 
	document.styleSheets[0].cssRules,
	rule => rule instanceof CSSStyleRule && rule.selectorText == "main svg"
);


const getScale = ([ , , width, height ]) =>
	Math.max( width, height ) * 0.01;

export function setThickness() {

	const rangeValue = thicknessSlider.value;
	const scale = getScale( 
		parseParams( document.querySelector( "main svg" )
			.getAttribute( "viewBox" ) ) 
	);
	svgRule.style.strokeWidth = ( (rangeValue / 100) ** 2 * scale ).toString();
}

