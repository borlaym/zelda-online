var ObjectTypes = require("./ObjectTypes.js");
var WorldObject = require("./WorldObject.js");

class Map {
	constructor() {
		this.objects = [];
		for (var x = 0; x < 16; x++) {
			this.objects.push([]);
			for (var y = 0; y < 11; y++) {
				this.objects[x].push(false);
			}
		}
		this.generateRandom();
	}
	generateRandom() {
		for (var i = 0; i < 15; i++) {
			var x = Math.floor(Math.random() * 16);
			var y = Math.floor(Math.random() * 11);
			this.objects[x][y] = new WorldObject({
				type: ObjectTypes.TREE,
				coordinates: [x, y]
			});
		}
	}
	getState() {
		return this.objects;
	}
}

module.exports = Map;