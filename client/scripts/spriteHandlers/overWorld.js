var ObjectTypes = require("../../../shared/ObjectTypes.js");

module.exports = {
	WIDTH: 16,
	HEIGHT: 16,

	ORIGIN: [0, 0],

	sprites: {
		[ObjectTypes.TREE]: [261, 129],
		[ObjectTypes.FLOOR_DIRT]: [242, 148],
		DOOR_NORTH: [243, 12, 32, 20],
		DOOR_NORTH2: [243, 49, 32, 20],
		DOOR_EAST: [314, 0, 20, 32],
		DOOR_EAST2: [314, 37, 20, 32],
		DOOR_SOUTH: [279, 12, 32, 20],
		DOOR_SOUTH2: [279, 49, 32, 20],
		DOOR_WEST: [337, 0, 20, 32],
		DOOR_WEST2: [337, 37, 20, 32],
		WALL_PATTERN : [0, 0, 8, 8]
	},

	roomSprite: [0, 12, 240, 160],

	load: function() {
		var self = this;
		return new Promise(function(success, failure) {
			self.image = new Image();
			self.image.onload = success;
			self.image.src = "images/spritesheets/dungeon-tiles.gif"
		});
		
	},
	getWallPattern: function() {
		if (this.pattern) {
			return this.pattern;
		}
		var canvas = document.createElement("canvas");
		canvas.width = 8;
		canvas.height = 8;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(this.image, 0, 0);
		var img = document.createElement("img");
		img.src = canvas.toDataURL();
		this.pattern = img;
		return img;
	}



}