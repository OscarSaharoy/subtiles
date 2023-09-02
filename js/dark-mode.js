// Oscar Saharoy 2023

import { recolour } from "./subdivide.js";

export let darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const darkModeIcon = "assets/dark-mode.svg";
const lightModeIcon = "assets/light-mode.svg";
const darkModeButton = document.querySelector( "button#dark-mode" );
darkModeButton?.addEventListener( "click", () => setDarkMode( !darkMode, true ) );

function setDarkMode(newDarkMode, redraw=false) {
	darkMode = newDarkMode;
	document.body.classList.toggle( "dark-mode" );
	if(redraw) recolour()
	darkModeButton.querySelector( "img" ).src =
		darkMode ? lightModeIcon : darkModeIcon;
}
if( darkMode ) setDarkMode(darkMode);

