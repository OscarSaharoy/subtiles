// Oscar Saharoy 2023

const logWindow = document.querySelector( "div#log" );
const logSpan = logWindow.querySelector( "span" );
const logCloseButton = logWindow.querySelector( "button" );

let logShown = false;
export const toggleLog = () => logShown ? hideLog() : showLog();
export const showLog = () =>
	[ logWindow.style.visibility, logSpan.scrollTop, logShown ] =
	[ "visible", logSpan.scrollHeight, true ];
export const hideLog = () => 
	[ logWindow.style.visibility, logShown ] = 
	[ "hidden", false ];

document.addEventListener( "keydown", event => "lL".includes(event.key) && toggleLog() );
document.addEventListener( "touchstart", event => event.touches.length === 3 && toggleLog() );
document.addEventListener( "keydown", event => event.key === "Escape" && hideLog() );
logCloseButton.onclick = hideLog;

const infoCSS = "";
const successCSS = "font-weight: bold; color: #0d0;";
const errorCSS = "font-weight: bold; color: red;";

const time = () => (new Date()).toLocaleTimeString();

export const makeLogFunc = cssString =>
	text => addLogLine({ text, cssString });

export const [ infoLog, successLog, errorLog ] = [ infoCSS, successCSS, errorCSS ].map( makeLogFunc );

successLog(`Welcome to subtiles!`);
successLog(`Begin log`);


function addLogLine({ text, cssString }) {

	const logLineText = `(${time()}) [subtiles] ${text}`;
	console.log(`%c ${logLineText}`, cssString );

	const newP = document.createElement( "p" );
	newP.textContent = logLineText;
	newP.setAttribute( "style", cssString );

	logSpan.appendChild( newP );

	if( cssString === errorCSS ) showLog();
}

