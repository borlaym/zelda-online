var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;

/**
 * Handles the position of objects in the world
 */
class GameObject {

	constructor(attributes) {
		attributes = attributes || {};
		this.direction = attributes.direction || UP;
		this.position = attributes.position || [Math.floor(Math.random() * 200), Math.floor(Math.random() * 200)];
		this.isMoving = false;
		this.speed = 50;
	}

	setDirection(direction) {
		this.direction = direction;
	}
};



module.exports = GameObject;