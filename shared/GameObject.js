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
		this.id = attributes.id;
		this.type = attributes.type;
		this.direction = attributes.direction || UP;
		this.position = attributes.position || [32, 32];
		this.isMoving = false;
		this.speed = 50;
	}

	setDirection(direction) {
		this.direction = direction;
	}

	/**
	 * Get the top left point of the sprite
	 */
	getWorldPosition() {
		return [this.position[0] - 8, this.position[1] - 16];
	}
};



module.exports = GameObject;