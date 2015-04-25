var GameObject = require("../shared/GameObject.js");
var ObjectTypes = require("../shared/ObjectTypes.js");

var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;

/**
 * Server side implementation of the GameObject, which handles actions
 */
class GameObjectServerImplementation extends GameObject {

	constructor(attributes) {
		super(attributes);
	}

	update(dt) {
		if (this.isMoving) {
			var distance = this.speed * dt / 1000;
			switch(this.direction) {
				
				case UP:
					this.position[1] -= distance;
					break;
				case RIGHT:
					this.position[0] += distance;
					break;
				case DOWN:
					this.position[1] += distance;
					break;
				case LEFT:
					this.position[0] -= distance;
					break;
			}
		}
	}

	getObject() {
		return {
			id: this.id,
			position: this.position,
			direction: this.direction,
			type: ObjectTypes.PLAYER_LINK
		}
	}
};



module.exports = GameObjectServerImplementation;