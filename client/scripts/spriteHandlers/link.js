module.exports = {
	WIDTH: 16,
	HEIGHT: 16,

	ORIGIN: [-8, -16],

	sprites: [
		//UP
		[
			[60, 0],
			[60,30],
			[60,60] //ATTACK
		],
		//RIGHT
		[
			[90, 0],
			[90,30],
			[90,60] //ATTACK
		],
		//DOWN
		[
			[0,0],
			[0, 30],
			[0, 60] //ATTACK
		],
		//LEFT
		[
			[30, 0],
			[30,30],
			[30,60] //ATTACK
		]
	],

	load: function() {
		var self = this;
		return new Promise(function(success, failure) {
			self.image = new Image();
			self.image.onload = success;
			self.image.src = "images/spritesheets/zelda-sprites-link.png"
		});
		
	}



}
