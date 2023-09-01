// Oscar Saharoy 2023

import { recolour } from "./subdivide.js";

export let darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
if( darkMode ) document.body.classList.add( "dark-mode" );

function toggleDarkMode() {
	darkMode = !darkMode;
	document.body.classList.toggle( "dark-mode" );
	recolour();
}

const darkModeButton = document.querySelector( "button#dark-mode" );
darkModeButton?.addEventListener( "click", toggleDarkMode );

