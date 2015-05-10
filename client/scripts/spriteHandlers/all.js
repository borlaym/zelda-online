var linkSprites = require("./link.js");
var overWorldSprites = require("./overWorld.js");
var projectileSprites = require("./projectiles.js");

module.exports = new Promise(function(resolve, reject) {
	Promise.all([linkSprites.load(), overWorldSprites.load(), projectileSprites.load()]).then(function() {
		resolve();
	});
});