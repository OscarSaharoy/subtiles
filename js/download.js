// Oscar Saharoy 2023

import { getThickness } from "./thickness.js";


function cleansePathElm( pathElm, { fill, stroke } ) {

	const style =
		`stroke-width: ${getThickness()}; ` +
		`stroke: ${stroke}; ` +
		`fill: ${fill};`;
	pathElm.setAttribute( "style", style );

	pathElm.removeAttribute( "fingerprint" );
	pathElm.removeAttribute( "stroke" );
	pathElm.removeAttribute( "fill" );
}


function getCleanSVG( svg, importedFileCache ) {

	const fillStrokes = [ ...svg.querySelectorAll( "path" ) ].map( pathElm => ({
		fill: window.getComputedStyle( pathElm ).fill,
		stroke: window.getComputedStyle( pathElm ).stroke,
	}));

	const svgClone = svg.cloneNode( true );
	svgClone.setAttribute( "width",  importedFileCache.width  );
	svgClone.setAttribute( "height", importedFileCache.height );

	const pathElms = [ ...svgClone.querySelectorAll( "path" ) ];
	pathElms.forEach( (pathElm, i) => cleansePathElm( pathElm, fillStrokes[i] ) );

	return svgClone;
}

export function download( svg, importedFileCache ) {

    // get svg data, re add width and height and make into a blob
    const svgClone = getCleanSVG( svg, importedFileCache );
    const blob = new Blob( [svgClone.outerHTML], {type: 'image/svg+xml'} );
        
    // create a dummy link with the blob
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
	const filename = importedFileCache.filename.split(".svg")[0];
    elem.download = `${filename}.subtiles.svg`;    
    elem.click();        
}

