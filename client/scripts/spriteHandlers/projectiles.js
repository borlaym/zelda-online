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
		],
		[ObjectTypes.MASTER_SWORD]: [
			[//UP,
				[32, 19], 
			],
			[ //RIGHT
				[48, 19]
			],
			[ //DOWN,
				[0, 19],
			],
			[ //LEFT,
				[16, 19]
			]
		],
		[ObjectTypes.BOMB]: [
			[//UP,
				[69, 0], 
			],
			[ //RIGHT
				[90, 0]
			],
			[ //DOWN,
				[67, 0],
			],
			[ //LEFT,
				[67, 0]
			]
		]
	},

	load: function() {
		var self = this;
		return new Promise(function(success, failure) {
			self.image = new Image();
			self.image.onload = success;
			self.image.src = "images/spritesheets/projectiles.png"
		});
		
	}



}
