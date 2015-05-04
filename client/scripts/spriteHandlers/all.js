var linkSprites = require("./link.js");
var overWorldSprites = require("./overWorld.js");

module.exports = new Promise(function(resolve, reject) {
	Promise.all([linkSprites.load(), overWorldSprites.load()]).then(function() {
		resolve();
	});
});