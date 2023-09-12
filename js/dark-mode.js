// Oscar Saharoy 2023

import { recolour } from "./subdivide.js";

export let darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const darkModeIcon = "assets/dark-mode.svg";
const lightModeIcon = "assets/light-mode.svg";
const darkModeButton = document.querySelector( "button#dark-mode" );
darkModeButton.addEventListener( "click", () => setDarkMode( !darkMode, true ) );

function setDarkMode(newDarkMode, redraw=false) {
	darkMode = newDarkMode;

	darkMode
		? document.body.classList.add( "dark-mode" )
		: document.body.classList.remove( "dark-mode" );

	darkModeButton.querySelector( "img" ).src =
		darkMode ? lightModeIcon : darkModeIcon;

	if(redraw) recolour()
}
setDarkMode( darkMode );

