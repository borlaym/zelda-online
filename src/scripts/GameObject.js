var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;


class GameObject {

	constructor(attributes) {
		attributes = attributes || {};
		this.spriteHandler = attributes.spriteHandler;
		this.direction = attributes.direction || UP;
		this.position = attributes.position || [30, 30];
		this.currentSprite = this.spriteHandler.sprites[this.direction][0];
		this.lastSpriteChange = [0, 0, 0, 0];
		this.spriteChangeFrequency = 300;
		this.currentFrame = 0;
		this.isMoving = false;
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



module.exports = GameObject;