var ObjectTypes = require("../../../shared/ObjectTypes.js")

module.exports = {
	WIDTH: 16,
	HEIGHT: 16,

	ORIGIN: [-8, -16],

	sprites: {
		[ObjectTypes.SWORD]: [
			[//UP,
				[32, 0], 
			],
			[ //RIGHT
				[48, 0]
			],
			[ //DOWN,
				[0, 0],
			],
			[ //LEFT,
				[16, 0]
			]
		]
	},

	load: function() {
		var self = this;
		return new Promise(function(success, failure) {
			self.image = new Image();
			self.image.onload = success;
			console.log("images/spritesheets/projectiles.png");
			self.image.src = "images/spritesheets/projectiles.png"
		});
		
	}



}
