// Oscar Saharoy 2023

export const logLines = [];

const infoCSS = "";
const successCSS = "font-weight: bold; color: #0d0;";
const errorCSS = "font-weight: bold; color: red;";

const time = () => (new Date()).toLocaleTimeString();

export const makeLogFunc = cssString =>
	text => console.log(`%c (${time()}) [subtiles] ${text}`, cssString )
		  + logLines.push({ text, cssString });

export const [ infoLog, successLog, errorLog ] = [ infoCSS, successCSS, errorCSS ].map( makeLogFunc );

