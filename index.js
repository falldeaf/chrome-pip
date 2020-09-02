const { nativeTheme, session, app, BrowserView, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')
const args = require('./args')
const shortcuts = require('./shortcuts')
const urlhandler = require('./urlhandler')
const { url } = require('inspector')
const fs = require('fs')
const YAML = require('yaml')

const pages = YAML.parse(fs.readFileSync('./setup.yml', 'utf8'));

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

	if(setup.url) {
		var url_opts = await urlhandler.parseYaml(setup.url, pages);
	} else {
		url_opts = {local: true, url: `file://${__dirname}/index.html`, extra_preload: false};
	}
	
	//Set User Agent and All preloads (default preload plus url specific preloads)
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36';
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	//session.defaultSession.setPreloads(preload(url_opts.extra_preload));
	//preload(url_opts.extra_preload);

	// Create the browser window.
	status.win = new BrowserWindow({
		//backgroundColor: '#2e2c29',
		width: 320,
		height: 180,
		frame: false,
		transparent: true,
		webPreferences: {
			//sandbox: true,
			nodeIntegrationInWorker: false,
			contextIsolation: false, // Must be disabled for preload script. I am not aware of a workaround but this *shouldn't* effect security
			nodeIntegration: false,
			plugins: true,
		}
	});

	//Set Preloads and Open the URL
	status.win.webContents.session.setPreloads(preload(url_opts.extra_preload));
	status.win.webContents.loadURL(url_opts.url);
	
	//Once the window is open, initiate ghost mode if it's set
	status.win.webContents.once('dom-ready', () => {
		status.win.webContents.send("apps", pages);
		if(setup.ghost) {
			status.ghost_mode = true;
			status.win.webContents.send("ghost", String(status.ghost_mode));
		}
		if(setup.debug) status.win.webContents.openDevTools();
	});

	status.win.webContents.on('did-navigate-in-page', async (e, url) => {
		e.preventDefault();
		shortcuts.unreg_media();
		status.win.close();
		var url_opts = await urlhandler.parseYaml(url, pages);
		if(url_opts.url != url) {
			createWindow({url: url});
		}
			/*
			console.log(status.win.webContents.session.getPreloads());
			status.win.webContents.session.setPreloads(preload(url_opts.extra_preload));
			console.log(status.win.webContents.session.getPreloads());
			status.win.webContents.loadURL(url_opts.url);
			if(url_opts.shortcuts) shortcuts.reg_media(status, url_opts.shortcuts);
		}*/
	});

	status.win.webContents.on('new-window', (e, url) => {
		e.preventDefault();
		console.log("No new windows");
		status.win.webContents.loadURL(url);
		//require('electron').shell.openExternal(url);
	  });

	status.win.setAlwaysOnTop(true, 'screen');

	shortcuts.reg_base(status, setWinPos, shutdown);
	if(url_opts.shortcuts) shortcuts.reg_media(status, url_opts.shortcuts);

	if(url_opts.local) {
		setWinPos("cnt", status.win, "");
	} else {
		setWinPos(setup.corner?setup.corner:"ll", status.win, status.dimensions);
	}
}

function preload(extra) {
	//console.log(`extra preload ${extra}`);
	var preloads = [path.join(__dirname, 'inject.js')]; //Default Preload
	if(extra) {
		file = path.join(__dirname, 'extra_preload.js');
		fs.writeFile(file, extra, () => {});
		preloads.push(file);
	}
	console.log(`Preloads ${preloads}`);
	//session.defaultSession.setPreloads(preloads);
	return preloads;
}

function setWinPos(pos, win, dimensions) {
	switch(pos) {
		case "ul":
			win.setPosition( 10, 10 );
			break;
		case "ur":
			win.setPosition( dimensions.width - status.sizes[status.size_index][0] - 10, 10 );
			break;
		case "ll":
			win.setPosition( 10, dimensions.height - status.sizes[status.size_index][1] - 50);
			break;
		case "lr":
			win.setPosition( dimensions.width - status.sizes[status.size_index][0] - 50, dimensions.height - status.sizes[status.size_index][1] - 50 );
			break;
		case "cnt":
			win.setSize(400, 800);
			win.center();
			break;
	}
}

function shutdown() {
	app.exit(0);
}

//app.whenReady().then(createWindow)
app.commandLine.appendSwitch('no-verify-widevine-cdm');

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

app.on('widevine-ready', async (version, lastVersion) => {
	if (null !== lastVersion) {
		console.log('Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!');
	} else {
		console.log('Widevine ' + version + ' is ready to be used!');
	}

	createWindow(await args.get());
});

app.on('will-quit', () => {
	shortcuts.unreg_all(status);
})