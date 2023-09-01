// Oscar Saharoy 2023

export let darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
if( darkMode ) document.body.classList.add( "dark" );

