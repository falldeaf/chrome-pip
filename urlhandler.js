module.exports = {
	handle: async function (url) {
		if(RegExp(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm).test(url)) {
			console.log("Youtube URL");
			var final_url = "https://www.youtube.com/embed/" + getIdFromYoutubeURL(url) + "?autoplay=1&enablejsapi=1";
			return {url: final_url, extra_preload: 'youtube.js'};
		} else if(url.includes('app.plex.tv')) {
			console.log('Plex URL');
			return {url: url, extra_preload: 'plex.js'};
		} else {
			console.log("Default URL");
			return {url: url};
		}
	}
}

function getIdFromYoutubeURL(url) {
	// regex from: https://stackoverflow.com/a/8260383/1492782
	const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	return match && match[1].length == 11 ? match[1] : false;
};