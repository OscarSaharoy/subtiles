// Oscar Saharoy 2023


// a space or enter keypress on a `.click-in` elm should be interpreted as a click
const clickIns = [ ...document.querySelectorAll( "form .click-in" ) ];

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
