console.log("Loading YT IPC Actions"); const { ipcRenderer } = require("electron"); var player;
ipcRenderer.on("action", (event, messages) => { console.log(messages); switch(messages) { case "play": yt_command("playVideo"); break; case "pause": yt_command("pauseVideo"); break; case "next": yt_command("nextVideo"); break; } });
function yt_command(func) { var ytcomm = JSON.stringify({"event": "command",	"func": func} ); console.log(ytcomm); window.postMessage(ytcomm, "https://www.youtube.com"); }
;0