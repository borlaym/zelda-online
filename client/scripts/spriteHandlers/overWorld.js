var ObjectTypes = require("../../../shared/ObjectTypes.js");

module.exports = {
	WIDTH: 16,
	HEIGHT: 16,

	ORIGIN: [0, 0],

	sprites: {
		[ObjectTypes.TREE]: [120, 18]
	},

	load: function() {
		var self = this;
		return new Promise(function(success, failure) {
			self.image = new Image();
			self.image.onload = success;
			self.image.src = "images/spritesheets/zelda-sprites-overworld.png"
		});
		
	}



}