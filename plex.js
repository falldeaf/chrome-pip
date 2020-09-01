const { ipcRenderer } = require('electron');

var player;


document.addEventListener('DOMContentLoaded', (event) => {

});

ipcRenderer.on('action', (event, messages) => {
	console.log(messages)
	
	switch(messages) {
		case "play":
			plex_command(false, false, false, 32);
			break;
		case "pause":
			plex_command(false, false, false, 32);
			break;
		case "next":
			plex_command(false, false, false, 35);
			break;
	}
});

function plex_command(ctrl, alt, shift, key) {
	var keyboardEvent = document.createEvent("KeyboardEvent");
	var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

	keyboardEvent[initMethod](
	"keydown", // event type: keydown, keyup, keypress
	true,      // bubbles
	true,      // cancelable
	window,    // view: should be window
	ctrl,     // ctrlKey
	alt,     // altKey
	shift,     // shiftKey
	false,     // metaKey
	key,        // keyCode: unsigned long - the virtual key code, else 0
	0          // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
	);
	document.dispatchEvent(keyboardEvent);

}


;0