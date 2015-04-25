var keyHandler = require("./keyHandler.js");

var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;


class GameObject = {

	constructor: function(attributes) {
		this.spriteHandler = attributes.spriteHandler;
		this.direction = attributes.direction || UP;
		this.position = attributes.position || [30, 30];
		this.currentSprite = spriteHandler.sprites[this.direction][0];
		var now = new Date();
		this.lastTimeSpriteChanged = [now, now, now, now];
	}

	draw = function(ctx) {
		var drawPosition = [this.position[0] + this.spriteHandler.ORIGIN[0], this.position[1] + this.spriteHandler.ORIGIN[1]];
		ctx.drawImage(this.spriteHandler.image, 
						this.currentSprite[0], 
						this.currentSprite[1], 
						this.spriteHandler.WIDTH, 
						this.spriteHandler.HEIGHT, 
						drawPosition[0], 
						drawPosition[1], 
						this.spriteHandler.WIDTH, 
						this.spriteHandler.HEIGHT);
	}

	update: function(dt) {
		
	}
};



module.exports = GameObject;