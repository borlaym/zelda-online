var GameObject = require("../../shared/GameObject");

var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;

/**
 * Client side implementation of the Game Object, which also handles displaying sprites
 */
class GameObjectClientImplementation extends GameObject {

	constructor(attributes) {
		attributes = attributes || {};
		super(attributes);
		this.spriteHandler = attributes.spriteHandler;
		this.currentSprite = this.spriteHandler.sprites[this.direction][0];
		this.lastSpriteChange = [0, 0, 0, 0];
		this.spriteChangeFrequency = 200;
		this.currentFrame = 0;
	}

	draw(ctx) {
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


	setDirection(direction) {
		if (this.direction === direction) {
			return;
		}
		this.direction = direction;
		this.currentSprite = this.spriteHandler.sprites[this.direction][this.currentFrame];
		this.lastSpriteChange[this.direction] = 0;
	}

	update(dt) {
		if (this.isMoving) {
			this.lastSpriteChange[this.direction] += dt;
		}
		if (this.lastSpriteChange[this.direction] >= this.spriteChangeFrequency && this.isMoving) {
			this.swapSpriteFrame();
		}
	}

	swapSpriteFrame() {
		this.currentFrame = 1 - this.currentFrame;
		this.currentSprite = this.spriteHandler.sprites[this.direction][this.currentFrame];
		this.lastSpriteChange[this.direction] = 0;
	}
};



module.exports = GameObjectClientImplementation;