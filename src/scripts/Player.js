var keyHandler = require("./keyHandler.js");
var GameObject = require("./GameObject.js");
var linkSpriteHandler = require("./spriteHandlers/link.js");

var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;

class Player extends GameObject {
	constructor(attributes) {
		attributes = attributes || {};
		attributes.spriteHandler = linkSpriteHandler;
		super(attributes);

		this.speed = 50;
	}
	update(dt) {
		super.update(dt);

		if (keyHandler.isKeyDown(keyHandler.UP_KEY)) {
			this.position[1] -= this.speed * dt / 1000;
			this.isMoving = true;
			this.setDirection(UP);
		}
		else if (keyHandler.isKeyDown(keyHandler.DOWN_KEY)) {
			this.position[1] += this.speed * dt / 1000;
			this.isMoving = true;
			this.setDirection(DOWN);
		} 
		else if (keyHandler.isKeyDown(keyHandler.RIGHT_KEY)) {
			this.position[0] += this.speed * dt / 1000;
			this.isMoving = true;
			this.setDirection(RIGHT);
		} 
		else if (keyHandler.isKeyDown(keyHandler.LEFT_KEY)) {
			this.position[0] -= this.speed * dt / 1000;
			this.isMoving = true;
			this.setDirection(LEFT);
		} else {
			this.isMoving = false;
		}

	}


};

module.exports = Player;