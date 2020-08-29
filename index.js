const { session, app, BrowserView, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')
const args = require('./args')
const shortcuts = require('./shortcuts')
const urlhandler = require('./urlhandler')
const { url } = require('inspector')

app.commandLine.appendSwitch('no-verify-widevine-cdm')

var status = {
	isOffline: false,
	ghost_mode: false,
	win: null,
	view: null,
	current_pos: "ll",
	sizes: [[160,90], [320, 180], [640, 360]],
	size_index: 1
}

ipcMain.on('mouseon', function(){
	if(status.ghost_mode) {
		console.log("mouseon");
		unmouseable(false);
	}
});
ipcMain.on('mouseoff', function(){
	if(status.ghost_mode)	{
		console.log("mouseoff");
		unmouseable(true);
	}
});

async function unmouseable(flag) {
	status.win.setIgnoreMouseEvents(flag)
}

async function createWindow (setup) {
	var url_opts = await urlhandler.handle(setup.url);
	console.log(url_opts);

	//Set User Agent and All preloads (default preload plus url specific preloads)
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36';
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});
	var preloads = [path.join(__dirname, 'inject.js')]; //Default Preload
	if(url_opts.extra_preload) preloads.push(path.join(__dirname, url_opts.extra_preload));
	session.defaultSession.setPreloads(preloads);

	// Create the browser window.
	status.win = new BrowserWindow({
		//backgroundColor: '#2e2c29',
		width: 320,
		height: 180,
		frame: false,
		transparent: true,
		webPreferences: {
			nodeIntegration: false,
			plugins: true,
			//preload: path.join(__dirname, 'inject.js')
		}
	})

	// and load the index.html of the app.
	//win.loadFile('test.html');
	//win.loadURL('https://www.youtube.com/embed/b8jzK684xxY?autoplay=1');

	//status.view = new BrowserView();//{webPreferences: {preload: path.join(__dirname, 'inject.js')}});
	//status.win.setBrowserView(status.view);
	//status.view.setBounds({ x: 0, y: 0, width: 320, height: 180 });
	//status.view.setAutoResize({width: true, height: true});
	//view.webContents.loadURL('https://www.hulu.com/watch/4f74eacd-40a5-45dc-acf8-6edc1d24e726')
	//status.view.webContents.loadURL('https://www.netflix.com/watch/80077923?trackId=14170286&tctx=3%2C2%2Cf65b9c87-670f-4384-8e7e-dfc01e84ef58-31441869%2Ca5d56d56-b693-4e9e-9f87-b8590a3ea368_13730585X3XX1598570254612%2Ca5d56d56-b693-4e9e-9f87-b8590a3ea368_ROOT%2C');
	//status.view.webContents.loadURL('https://www.youtube.com/embed/b8jzK684xxY?autoplay=1');
	//view.webContents.loadURL('https://bitmovin.com/demos/drm');
	//win.loadURL('https://vimeo.com/451978443');
	//status.win.loadURL('https://www.hulu.com/watch/4f74eacd-40a5-45dc-acf8-6edc1d24e726');

	status.win.webContents.loadURL(url_opts.url);
	
	status.win.webContents.once('dom-ready', () => {
		if(setup.debug) status.win.webContents.openDevTools();
		if(setup.ghost) {
			status.ghost_mode = true;
			status.win.webContents.send("ghost", String(status.ghost_mode));
		}
	});

	status.win.setAlwaysOnTop(true, 'screen');

	shortcuts.reg_base(status, setWinPos, shutdown);

	setWinPos(setup.corner?setup.corner:"ll", status.win, status.dimensions);
}

function setWinPos(pos, win, dimensions) {
	switch(pos) {
		case "ul":
			status.win.setPosition( 10, 10 );
			break;
		case "ur":
			status.win.setPosition( dimensions.width - status.sizes[status.size_index][0] - 10, 10 );
			break;
		case "ll":
			status.win.setPosition( 10, dimensions.height - status.sizes[status.size_index][1] - 50);
			break;
		case "lr":
			status.win.setPosition( dimensions.width - status.sizes[status.size_index][0] - 50, dimensions.height - status.sizes[status.size_index][1] - 50 );
			break;
	}
}

function shutdown() {
	app.exit(0);
}

//app.whenReady().then(createWindow)

app.on('ready', () => {
	var mainScreen = screen.getPrimaryDisplay();
	status.dimensions = mainScreen.size;
	// Demonstrating with default session, but a custom session object can be used
	//Dumb DRM shit from: https://github.com/castlabs/electron-releases
	app.verifyWidevineCdm({
	  session: session.defaultSession,
	  disableUpdate: status.isOffline,
	});
  
	// Do other early initialization...
});

app.on('widevine-ready', async () => {
	createWindow(await args.get());
});

app.on('will-quit', () => {
	shortcuts.unreg_all(status);
})