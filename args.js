const optionDefinitions = [
	{ name: 'ghost', alias: 'g', type: Boolean },
	{ name: 'debug', alias: 'd', type: Boolean },
	{ name: 'url', type: String, multiple: false, defaultOption: true },
	{ name: 'corner', type: String, multiple: false, defaultOption: false },
	{ name: 'size', alias: 's', type: Number }
];

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

module.exports = {
	get: async function () {
		return options;
	}
}