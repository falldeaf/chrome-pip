
const { globalShortcut } = require('electron')

//Set Keyboard Shortcuts from: https://www.electronjs.org/docs/api/accelerator

module.exports = {
	//Register base shortcuts
	reg_base: async function (status, setWinPos, createWindow, shutdown, mousemode) {

		/////////////////////////////
		//Base keys

		//sizeup
		globalShortcut.register('Super+Num8', () => {
			if(status.win.isMinimized()) status.win.restore();
			if(status.size_index < status.sizes.length) status.size_index++;
			if(status.size_index == status.sizes.length) {
				status.win.setFullScreen(true);
			} else {
				if(status.win.isFullScreen()) status.win.setFullScreen(false);
				status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
				setWinPos(status.current_pos, status.win, status.dimensions);
			}
			console.log('Sizeup: ' + status.size_index + "/" + status.sizes.length);
		})

		//sizedown
		globalShortcut.register('Super+Num2', () => {
			if(status.size_index > -1) status.size_index--;
			if(status.size_index == -1) {
				status.win.minimize();
			} else {
				if(status.win.isMinimized()) status.win.restore();
				status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
				setWinPos(status.current_pos, status.win, status.dimensions);
			}
			console.log('Sizedown: ' + status.size_index + "/" + status.sizes.length);
		})

		//move upper right
		globalShortcut.register('Super+Num9', () => {
			//console.log('Upper Right');
			status.current_pos = "ur";
			setWinPos("ur", status.win, status.dimensions);
		})

		//move upper left
		globalShortcut.register('Super+Num7', () => {
			//console.log('Upper Left');
			status.current_pos = "ul";
			setWinPos("ul", status.win, status.dimensions);
		})

		//move lower right
		globalShortcut.register('Super+Num3', () => {
			//console.log('Lower Right');
			status.current_pos = "lr";
			setWinPos("lr", status.win, status.dimensions);
		})

		//move lower left
		globalShortcut.register('Super+Num1', () => {
			//console.log('Lower Left');
			status.current_pos = "ll";
			setWinPos("ll", status.win, status.dimensions);
		})

		//return to index
		globalShortcut.register('Super+Num0', () => {
			//console.log('Lower Left');
			status.current_pos = "cnt";
			createWindow({});
		})

		//toggle ghost
		globalShortcut.register('Super+Num4', () => {
			//console.log('Toggle ghost');
			status.ghost_mode = !status.ghost_mode;
			status.win.webContents.send("ghost", String(status.ghost_mode));
		})

		//close app
		globalShortcut.register('Super+Num6', () => {
			shutdown();
		})

	},

	reg_media: async function (status, shortcuts) {
		//////////////////////
		//MEDIA KEYS

		var short_keys = {
			"comm_back": "Control+Super+Num1",
			"comm_play": "Control+Super+Num2",
			"comm_forward": "Control+Super+Num3",
			"comm_voldown": "Control+Super+Num4",
			"comm_mute": "Control+Super+Num5",
			"comm_volup": "Control+Super+Num6",
			"comm_prev": "Control+Super+Num7",
			"comm_special": "Control+Super+Num8",
			"comm_next": "Control+Super+Num9",
		}

		if(shortcuts.type == "ipc") {
			for (const [key, value] of Object.entries(short_keys)) {
				globalShortcut.register(value, () => {
					status.win.webContents.send("action", key);
				});
			}
		} else if(shortcuts.type == "keyboard") {
			for (const [key, value] of Object.entries(shortcuts)) {
				console.log("Register " + short_keys[key] + " as " + value);
				if(short_keys[key]) {
					globalShortcut.register(short_keys[key], () => {
						sendKeys(value, status);
					});
				}
			}
		}
	},

	unreg_media: function() {
		globalShortcut.unregister('Control+Super+Num1');
		globalShortcut.unregister('Control+Super+Num2');
		globalShortcut.unregister('Control+Super+Num3');
		globalShortcut.unregister('Control+Super+Num4');
		globalShortcut.unregister('Control+Super+Num5');
		globalShortcut.unregister('Control+Super+Num6');
		globalShortcut.unregister('Control+Super+Num7');
		globalShortcut.unregister('Control+Super+Num8');
		globalShortcut.unregister('Control+Super+Num9');
	},

	unreg_all: function() {
		// Unregister all shortcuts.
		globalShortcut.unregisterAll();
	}
}

function sendKeys(accel, status) {
	var mod = [];
	if(accel.includes('Alt')) {
		mod.push('alt');
	} else if(accel.includes('Control')) {
		mod.push('control');
	} else if(accel.includes('Shift')) {
		mod.push('shift');
	}
	
	var key = accel.split('+').pop();
	status.win.webContents.sendInputEvent({type: 'keyDown', modifiers: mod, keyCode: key})
	status.win.webContents.sendInputEvent({type: 'char', modifiers: mod, keyCode: key});
}