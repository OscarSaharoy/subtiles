// Oscar Saharoy 2023

const clickIns = [ ...document.querySelectorAll( "form .click-in" ) ];

clickIns.forEach( 
	elm => elm.addEventListener( "keydown", e => 
		( e.key == " " || e.key == "Enter" ) && elm.click() 
	) 
);

