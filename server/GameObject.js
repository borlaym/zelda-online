var GameObject = require("../shared/GameObject.js");
var ObjectTypes = require("../shared/ObjectTypes.js");
var EventEmitter = require("events").EventEmitter;

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
		this.events = new EventEmitter;
		this.world = attributes.world;
	}

	update(dt) {
		if (this.isMoving) {
			var distance = this.speed * dt / 1000;

			//First we only save the position that would become the object's position if everything was all right (ie no collisions)
			var newPosition = [this.position[0], this.position[1]];

			switch(this.direction) {
				
				case UP:
					newPosition[1] -= distance;
					break;
				case RIGHT:
					newPosition[0] += distance;
					break;
				case DOWN:
					newPosition[1] += distance;
					break;
				case LEFT:
					newPosition[0] -= distance;
					break;
			}

			//Check if we would collide with a World Object
			var map = this.world.map.objects;
			var targetGrid = [Math.floor(newPosition[0] / 16), Math.floor(newPosition[1] / 16)];
			if (targetGrid[0] < map.length &&
				targetGrid[0] >= 0 &&
		 		targetGrid[1] < map[0].length && 
		 		targetGrid[1] >= 0 && 
				!map[targetGrid[0]][targetGrid[1]]

					) {
							this.position = newPosition;
							this.events.emit("change");
			}



		}
	}

	getObject() {
		return {
			id: this.id,
			position: this.position,
			direction: this.direction,
			type: ObjectTypes.PLAYER_LINK,
			isMoving: this.isMoving
		}
	}

};



module.exports = GameObjectServerImplementation;