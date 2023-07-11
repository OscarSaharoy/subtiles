// Oscar Saharoy 2023

import { seconds } from "./utility.js";


// a space or enter keypress on a `.click-in` elm should be interpreted as a click
const clickIns = [ ...document.querySelectorAll( "form .click-in, .options-list p" ) ];

clickIns.forEach( elm => 
	elm.addEventListener( "keydown", e => 
		( e.key == " " || e.key == "Enter" ) && elm.click() 
	) 
);


// take focus away from other buttons when mouse enters either of the menus
const menus = [ "preset", "mapping" ].map( s => document.getElementById( s ) );

menus.forEach( elm =>
	elm.addEventListener( "pointermove", e => document.activeElement.blur() )
);


// when a menu option is clicked, the menu should close
const menuOptions = [ ...document.querySelectorAll( ".options-list p" ) ];

const unhoverMenus = () => 
	[ ...document.querySelectorAll( ".options" ) ].forEach( async elm =>
		( elm.style.display = "none" ) + document.activeElement.blur() + await seconds(0.1) + ( elm.style.display = "" )
	);

menuOptions.forEach( elm =>
	elm.addEventListener( "click", unhoverMenus )
);

window.addEventListener( "keydown", e => e.key == "Escape" && unhoverMenus() );
