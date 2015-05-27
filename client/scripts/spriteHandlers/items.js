var ObjectTypes = require("../../../shared/ObjectTypes.js")

module.exports = {
	WIDTH: 16,
	HEIGHT: 16,

	ORIGIN: [-8, -16],

	sprites: {
		[ObjectTypes.HEART]: [258, 123, 5, 5],
		[ObjectTypes.HALF_HEART]: [264, 123, 5, 5],
		[ObjectTypes.HEART_CONTAINER]: [244, 124, 7, 8],
		[ObjectTypes.RUPEE]: [164, 120, 8, 16],
		[ObjectTypes.MASTER_SWORD]: [364, 120, 7, 16],
		[ObjectTypes.BOMB]: [204, 1, 8, 14],
	},

	load: function() {
		var self = this;
		return new Promise(function(success, failure) {
			self.image = new Image();
			self.image.onload = success;
			self.image.src = "images/spritesheets/zelda-sprites-items.png"
		});
		
	}



}
