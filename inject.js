const { ipcRenderer, app } = require('electron');

var hoverwait = false;
var ghostmode = false;


//document.addEventListener('DOMContentLoaded', (event) => {

	//document.body.innerHTML += `
	//<div id="webpip-overlay" style="top: 40px; left: 3px; position:absolute; width:30px; height:100px; opacity:1; z-index:100; background:#F50; ">
	//	<div id="close-button" style="radius:25px; margin: 3px; width:20px;> X </a>
	//</div>
	//`;
	//document.getElementById('webpip-overlay').style.opacity = "0.2";

document.addEventListener('DOMContentLoaded', (event) => {

	ipcRenderer.on('apps', (event, apps) => {
		console.log(apps);
		if(typeof setupApplist == 'function') {
			setupApplist(apps);
		}
		window.app_list = apps;
	});

	//Ghost Icon
	var node = document.createElement("div");
	node.id = "ghosticon";
	node.style.cssText = "display:none; z-index:100; top: 5px; left: 5px; position:absolute; opacity:0.3; width:20px; height:20px; background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABeklEQVQ4T+XUsUuVYRTH8c/NxcRQiBbDKAcJMgsaymppycDBrf8gaggahEAI3TQiAqFFt/oPHBpsacqgIcq0cJKKWipo6roVR86Ft5f33vcObp3tPc853/c5v3Oe07DP1uiCN4xTGbeFL51yOgGPYhlTJcAz3MTXKnA74HmsYaDNbX5hEq/L51XAg3iL0Ro5tnEWu8W4KuAMHnahbYRE7KM6YJR6FfdwHeMl+Ec8wf2U5Vod8F2WG/r14AVC07A4u4wmfuAzzlQBD+BWBs3lmDxN2DyOZ1J0Nr7jBzcQY7SAQ1jBn5aGF/Aqk77jSJca/sThjD2HNy1gPz4ghrhsj7GYzlncrojZyaqaxS6PZInHCgnruFQCvMTFgi9gV/ApfOWxOZE37c2EkOF5CRgTMJG+mMGTLVgVMHybhbdbJ2U0ZaxubP5D4AZW8R5LiGVxN3V6kK/kDk5juvw0q5ZDiBw6hg2iD9/yewi/EesrrBi75+hmY9d1+p/zv9UxRxVLikJqAAAAAElFTkSuQmCC);";
	document.body.appendChild(node); 

	//Ghost mode switcher/listener
	document.body.addEventListener("mousemove", function(event) {
		if(!hoverwait && ghostmode) {
			hoverwait = true;
			document.getElementsByTagName("html")[0].style.opacity = "0.1";
			ipcRenderer.send('mouseoff');
			setTimeout(function(){
				document.getElementsByTagName("html")[0].style.opacity = "1";
				ipcRenderer.send('mouseon');
				hoverwait = false;
			}, 3000);
		}

	});

});

ipcRenderer.on('ghost', (event, messages) => {
	console.log(messages)
	ghostmode = (messages == "true");
	document.getElementById('ghosticon').style.display = (messages == "true"?"block":"none");
});

;0