var ObjectTypes = require("./ObjectTypes.js");
var WorldObject = require("./WorldObject.js");

class Map {
	constructor() {
		this.objects = [];
		for (var row = 0; row < 11; row++) {
			this.objects.push([]);
			for (var col = 0; col < 16; col++) {
				this.objects[row].push(false);
			}
		}
		this.generateRandom();
	}
	generateRandom() {
		for (var i = 0; i < 15; i++) {
			var row = Math.floor(Math.random() * 11);
			var col = Math.floor(Math.random() * 16);
			this.objects[row][col] = new WorldObject({
				type: ObjectTypes.TREE
			});
		}
	}
	getState() {
		return this.objects;
	}
}

module.exports = Map;