const shortcuts = require("./shortcuts");

module.exports = {
	parseYaml: async function(url, yaml_json) {
		for(var profile of yaml_json) {
			if( new RegExp(profile.regex_ops.test, "gim").test(url) ) {
				console.log(profile.name + " URL");
				if( profile.regex_ops.regex ) {
					url = url.replace(new RegExp(profile.regex_ops.regex, "gim"), profile.regex_ops.replacement );
					console.log("modded url: " + url);
				}

				return {
					url: url,
					extra_preload: profile.preload_code,
					shortcuts: profile.shortcuts,
					local: false
				}
			}
		}

		console.log("Default URL");
		return {url: url, extra_preload: false, local: false, shortcuts: false};
	},

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