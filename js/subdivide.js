// Oscar Saharoy 2023

import { svg, svgCache, tileList } from "./upload.js";

const plusButton = document.getElementById( "plus" );
const minusButton = document.getElementById( "minus" );

plusButton.addEventListener( "click", plus );
minusButton.addEventListener( "click", minus );

export let divisionDepth = 0;
export const resetDivisionDepth = () => divisionDepth = 0;

export function plus() {

	++divisionDepth;

	if( divisionDepth in svgCache )
		svg.innerHTML = svgCache[ divisionDepth ];
	
	else
		svgCache[ divisionDepth ] = svg.innerHTML = tileList.subdivide().toSVG();
}

function minus() {

	divisionDepth = Math.max( 0, divisionDepth - 1 );
	svg.innerHTML = svgCache[ divisionDepth ];
}

