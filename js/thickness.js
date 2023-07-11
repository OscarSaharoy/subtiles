// Oscar Saharoy 2023

const thicknessSlider = document.querySelector( "#thickness input" );

thicknessSlider.addEventListener( "input", e => setThickness( e.target.value ) );

const svgRule = Array.prototype.find.call( 
	document.styleSheets[0].cssRules,
	rule => rule instanceof CSSStyleRule && rule.selectorText == "#container > svg"
);


function setThickness( rangeValue ) {

	svgRule.style.strokeWidth = ( (rangeValue / 100) ** 3 / 40 ).toString();
}

