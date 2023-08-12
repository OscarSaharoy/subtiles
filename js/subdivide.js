// Oscar Saharoy 2023

import { svg, svgCache, tileList } from "./upload.js";
import { infoLog } from "./log.js";

const countSpan = document.querySelector( "span#count" );
const plusButton = document.getElementById( "plus" );
const minusButton = document.getElementById( "minus" );

plusButton.addEventListener( "click", plus );
minusButton.addEventListener( "click", minus );

export let divisionDepth = 0;
export const resetDivisionDepth = () => divisionDepth = 0;

export function plus() {
	const startTime = performance.now();

	++divisionDepth;

	if( divisionDepth in svgCache )
		svg.innerHTML = svgCache[ divisionDepth ];
	
	else
		svgCache[ divisionDepth ] = svg.innerHTML = tileList.subdivide().toSVG();

	updateSubtilesCount();

	const secondsTaken = Math.ceil( performance.now() - startTime );
	infoLog(`Calculated subdivision level ${divisionDepth} in ${secondsTaken}ms`);
}

function minus() {
	const startTime = performance.now();

	divisionDepth = Math.max( 0, divisionDepth - 1 );

	svg.innerHTML = svgCache[ divisionDepth ];
	updateSubtilesCount();

	const secondsTaken = Math.ceil( performance.now() - startTime );
	infoLog(`Calculated subdivision level ${divisionDepth} in ${secondsTaken}ms`);
}

function updateSubtilesCount() {
	const count = svg.innerHTML.split("\n").length;
	const sub   = divisionDepth === 0 ? "" : "sub";
	const label = count === 1 ? "tile" : "tiles";
	countSpan.innerHTML = `${count} ${sub}${label}`;
}
