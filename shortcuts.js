
const { globalShortcut } = require('electron')

//Set Keyboard Shortcuts from: https://www.electronjs.org/docs/api/accelerator

module.exports = {
	//Register base shortcuts
	reg_base: async function (status, setWinPos, shutdown) {

		//sizeup
		globalShortcut.register('Super+Num8', () => {
			console.log('Sizeup');
			if(status.size_index < 2) status.size_index++;
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			setWinPos(status.current_pos, status.win, status.dimensions);
		})

		//sizedown
		globalShortcut.register('Super+Num2', () => {
			console.log('Sizedown');
			if(status.size_index > 0) status.size_index--;
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			setWinPos(status.current_pos, status.win, status.dimensions);
		})

		//move upper right
		globalShortcut.register('Super+Num9', () => {
			console.log('Upper Right');
			current_pos = "ur";
			setWinPos("ur", status.win, status.dimensions);
		})

		//move upper left
		globalShortcut.register('Super+Num7', () => {
			console.log('Upper Left');
			current_pos = "ul";
			setWinPos("ul", status.win, status.dimensions);
		})

		//move lower right
		globalShortcut.register('Super+Num3', () => {
			console.log('Lower Right');
			current_pos = "lr";
			setWinPos("lr", status.win, status.dimensions);
		})

		//move lower left
		globalShortcut.register('Super+Num1', () => {
			console.log('Lower Left');
			current_pos = "ll";
			setWinPos("ll", status.win, status.dimensions);
		})

		//toggle ghost
		globalShortcut.register('Super+Num4', () => {
			console.log('Toggle ghost');
			status.ghost_mode = !status.ghost_mode;
			status.win.webContents.send("ghost", String(status.ghost_mode));
		})

		//Play
		globalShortcut.register('Control+Super+Num1', () => {
			console.log('Send Play');
			status.win.webContents.send("action", "play");
		})

		//Pause
		globalShortcut.register('Control+Super+Num2', () => {
			console.log('Send Pause');
			status.win.webContents.send("action", "pause");
		})

		//Next
		globalShortcut.register('Control+Super+Num3', () => {
			console.log('Send Next');
			status.win.webContents.send("action", "next");
		})

		//close app
		globalShortcut.register('Super+Num6', () => {
			shutdown();
		})

	},

	unreg_all: function() {
		// Unregister all shortcuts.
		globalShortcut.unregisterAll();
	}
}