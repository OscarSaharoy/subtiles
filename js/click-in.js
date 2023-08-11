// Oscar Saharoy 2023

import { seconds } from "./utility.js";


// a space or enter keypress on a `.click-in` elm should be interpreted as a click
const clickIns = [ ...document.querySelectorAll( "form .click-in, .options-list p" ) ];

clickIns.forEach( elm => 
	elm.addEventListener( "keydown", e => 
		( e.key == " " || e.key == "Enter" ) && elm.click() 
	) 
);

// when a menu option is clicked, the menu should close
const menuOptions = [ ...document.querySelectorAll( ".options-list p" ) ];

menuOptions.forEach( elm =>
	elm.addEventListener( "click", () => document.activeElement.blur() )
);

window.addEventListener( "keydown", e => e.key == "Escape" && document.activeElement.blur() );
