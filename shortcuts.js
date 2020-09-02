
const { globalShortcut } = require('electron')

//Set Keyboard Shortcuts from: https://www.electronjs.org/docs/api/accelerator

module.exports = {
	//Register base shortcuts
	reg_base: async function (status, setWinPos, shutdown, mousemode) {

		/////////////////////////////
		//Base keys

		//sizeup
		globalShortcut.register('Super+Num8', () => {
			//console.log('Sizeup');
			if(status.size_index < 2) status.size_index++;
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			setWinPos(status.current_pos, status.win, status.dimensions);
		})

		//sizedown
		globalShortcut.register('Super+Num2', () => {
			//console.log('Sizedown');
			if(status.size_index > 0) status.size_index--;
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			setWinPos(status.current_pos, status.win, status.dimensions);
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

		//<< go back
		globalShortcut.register('Control+Super+Num1', () => {
			console.log('Send Play');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "back");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput(shortcuts.comm_back);
			}

		})

		////play controls
		//Toggle Play
		globalShortcut.register('Control+Super+Num2', () => {
			console.log('Send Play');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "play");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInputEvent({type: 'keyDown', keyCode: shortcuts.comm_play})
				status.win.webContents.sendInputEvent({type: 'char', keyCode: shortcuts.comm_play});
			}
		})

		//>> go forward
		globalShortcut.register('Control+Super+Num3', () => {
			console.log('Send Next');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "forward");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput(shortcuts.comm_forward);
			}
		})

		/////volume
		//volume down
		globalShortcut.register('Control+Super+Num4', () => {
			console.log('Send Play');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "voldown");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput(shortcuts.comm_voldown);
			}
		})

		//Toggle Mute
		globalShortcut.register('Control+Super+Num5', () => {
			console.log('Send Pause');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "mute");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput(shortcuts.comm_mute);
			}
		})

		//volume up
		globalShortcut.register('Control+Super+Num6', () => {
			console.log('Send Next');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "volup");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput(shortcuts.comm_volup);
			}
		})

		/////tracks
		//previous track
		globalShortcut.register('Control+Super+Num7', () => {
			console.log('Send Play');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "prev");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput(shortcuts.comm_prev);
			}
		})

		//special
		globalShortcut.register('Control+Super+Num8', () => {
			console.log('Send Pause');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "special");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput(shortcuts.comm_special);
			}
		})

		//next track
		globalShortcut.register('Control+Super+Num9', () => {
			console.log('Send Next');
			if(shortcuts.type == "ipc") {
				status.win.webContents.send("action", "next");
			} else if(shortcuts.type == "keyboard") {
				status.win.webContents.sendInput({char: shortcuts.comm_next});
			}
		})

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