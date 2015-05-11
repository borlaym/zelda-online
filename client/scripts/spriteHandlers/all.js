var linkSprites = require("./link.js");
var overWorldSprites = require("./overWorld.js");
var projectileSprites = require("./projectiles.js");
var itemSprites = require("./items.js");

module.exports = new Promise(function(resolve, reject) {
	Promise.all([linkSprites.load(), overWorldSprites.load(), projectileSprites.load(), itemSprites.load()]).then(function() {
		resolve();
	});
});