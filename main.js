const { shell, nativeImage, nativeTheme, session, app, BrowserView, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')
const args = require('./args')
const shortcuts = require('./shortcuts')
const urlhandler = require('./urlhandler')
const { url } = require('inspector')
const fs = require('fs')
const YAML = require('yaml')

const pages = YAML.parse(fs.readFileSync(path.join(__dirname, 'setup.yml'), 'utf8'));

let status = {
	isOffline: false,
	ghost_mode: false,
	win: null,
	view: null,
	current_pos: "ll",
	sizes: [[160,90], [320, 180], [640, 360]],
	size_index: 1,
	deep_link: "",
	extra: ""
}

let have_lock = app.requestSingleInstanceLock();
console.log("Have Lock? " + have_lock);
if (have_lock) {
	app.on('second-instance', (e, argv) => {
		console.log("A clone tried to open, steal his url and do it instead: " + argv[3]);

		console.log(status.win);
		//status.win.close();

		createWindow({url: argv[3].replace('webpip://', "https://")});
	});
} else {
	console.log("I'm a clone...");
	app.exit(0);
	return
}

ipcMain.on('openurl', function(e, url){
	status.win.minimize();
	shell.openExternal(url);
});

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
ipcMain.on('setsize', function(e, size_string){
	console.log(size_string);
	setWinPos(size_string, status.win, status.dimensions);
});

async function unmouseable(flag) {
	status.win.setIgnoreMouseEvents(flag)
}

async function createWindow (setup) {

	if(setup.url) {
		var url_opts = await urlhandler.parseYaml(setup.url, pages);
	} else {
		url_opts = {local: true, url: `file://${__dirname}/static/index.html`, extra_preload: false};
	}
	
	//Set User Agent and All preloads (default preload plus url specific preloads)
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36';
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	//If this site had code that should be executed on this page, stage it for execution (or false)
	status.extra = url_opts.extra_preload;


	// Create the browser window.
	if(!status.win) {
		status.win = new BrowserWindow({
			//backgroundColor: '#2e2c29',
			width: 320,
			height: 180,
			frame: false,
			icon: nativeImage.createFromPath(path.join(__dirname, '/desktop-icon.ico')),
			transparent: true,
			webPreferences: {
				//sandbox: true,
				nodeIntegrationInWorker: false,
				contextIsolation: false, // Must be disabled for preload script. I am not aware of a workaround but this *shouldn't* effect security
				nodeIntegration: false,
				preload: path.join(__dirname, 'inject.js'),
				plugins: true,
			}
		});

		//REGISTER WINDOW CALLBACKS
		//only register these the first time we create a window
	
		//Once the window is open, initiate ghost mode if it's set
		status.win.webContents.once('dom-ready', () => {
			status.win.webContents.send("apps", pages);
			if(setup.ghost) {
				status.ghost_mode = true;
				status.win.webContents.send("ghost", String(status.ghost_mode));
			}
			if(setup.debug) status.win.webContents.openDevTools();
			if(status.extra) status.win.webContents.executeJavaScript(status.extra);
		});

		//Intercept URL navigation to modify the url or add shortcuts and inject code
		status.win.webContents.on('will-navigate', async (e, url) => { interceptUrls(e, url); });
		status.win.webContents.on('did-navigate-in-page', async (e, url) => { interceptUrls(e, url); });

		//Don't let new windows open (single page app!)
		status.win.webContents.on('new-window', (e, url) => {
			e.preventDefault();
			status.win.webContents.loadURL(url);
		});

		//For now, always on top (maybe make this configurable later?)
		status.win.setAlwaysOnTop(true, 'screen');

		//Register the Base shortcuts for manipulating the window (Media shortcuts registered on per-page basis)
		shortcuts.reg_base(status, setWinPos, createWindow, shutdown);

	}

	status.win.setIcon(nativeImage.createFromPath(path.join(__dirname, '/desktop-icon.ico')));
	status.win.webContents.loadURL(url_opts.url);

	if(url_opts.local) {
		setWinPos("cnt", status.win, "");
	} else {
		setWinPos(setup.corner?setup.corner:"ll", status.win, status.dimensions);
	}
}

/*
function preload(extra) {
	var preloads = [path.join(__dirname, 'inject.js')]; //Default Preload
	if(extra) {
		file = path.join(__dirname, 'extra_preload.js');
		fs.writeFile(file, extra, () => {});
		preloads.push(file);
	}
	return preloads;
}
*/

async function interceptUrls(e, url) {
	shortcuts.unreg_media();
	var url_opts = await urlhandler.parseYaml(url, pages);
	if(url_opts.shortcuts) shortcuts.reg_media(status, url_opts.shortcuts);

	if(url_opts.url != url) {
		//status.win.close();
		e.preventDefault();
		createWindow({url: url});
	}
}

function setWinPos(pos, win, dimensions) {
	switch(pos) {
		case "ul":
			win.setPosition( 10, 10 );
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			break;
		case "ur":
			win.setPosition( dimensions.width - status.sizes[status.size_index][0] - 10, 10 );
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			break;
		case "ll":
			win.setPosition( 10, dimensions.height - status.sizes[status.size_index][1] - 50);
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			break;
		case "lr":
			win.setPosition( dimensions.width - status.sizes[status.size_index][0] - 10, dimensions.height - status.sizes[status.size_index][1] - 50 );
			status.win.setSize( status.sizes[status.size_index][0], status.sizes[status.size_index][1] );
			break;
		case "cnt":
			status.size_index = 1;
			win.setSize(300, 550);
			win.center();
			break;
		case "cntbig":
			status.size_index = 1;
			win.setSize(dimensions.width-200, dimensions.height-100);
			win.center();
			break;
	}
}

function shutdown() {
	app.exit(0);
}

//app.whenReady().then(createWindow)
//app.commandLine.appendSwitch('no-verify-widevine-cdm');

// remove so we can register each time as we run the app. 
app.removeAsDefaultProtocolClient('webpip');

// If we are running a non-packaged version of the app && on windows
//if(process.env.NODE_ENV === 'development' && process.platform === 'win32') {
	// Set the path of electron.exe and your app.
	// These two additional parameters are only available on windows.
	app.setAsDefaultProtocolClient('webpip', process.execPath, [path.resolve(process.argv[1])]);        
//} else {
	//app.setAsDefaultProtocolClient('webpip');
//}

app.on('ready', async () => {
	var mainScreen = screen.getPrimaryDisplay();
	status.dimensions = mainScreen.size;
	createWindow(await args.get());

	/*
	// Demonstrating with default session, but a custom session object can be used
	//Dumb DRM shit from: https://github.com/castlabs/electron-releases
	app.verifyWidevineCdm({
	  session: session.defaultSession,
	  disableUpdate: status.isOffline,
	});
	*/
  
	// Do other early initialization...
});

/*
app.on('widevine-ready', async (version, lastVersion) => {
	if (null !== lastVersion) {
		console.log('Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!');
	} else {
		console.log('Widevine ' + version + ' is ready to be used!');
	}

	
	createWindow(await args.get());
});
*/

app.on('will-quit', () => {
	shortcuts.unreg_all(status);
})