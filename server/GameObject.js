var GameObject = require("../shared/GameObject.js");
var ObjectTypes = require("../shared/ObjectTypes.js");
var EventEmitter = require("events").EventEmitter;

var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;

/**
 * Helper function to check if two rectangles overlap
 * @param  {Array} rect1  Top left corner of rectangle 1, array of two coordinates
 * @param  {Array} rect2  Top left corner of rectangle 2, array of two coordinates
 * @return {Boolean} 
 */
function rectanglesOverlap (rect1TopLeft, rect2TopLeft) {
	var rect1BottomRight = [rect1TopLeft[0] + 16, rect1TopLeft[1] + 16];
	var rect2BottomRight = [rect2TopLeft[0] + 16, rect2TopLeft[1] + 16];

	if (rect1BottomRight[0] < rect2TopLeft[0] || rect2BottomRight[0] < rect1TopLeft[0]) {
		return false;
	}

	if (rect1BottomRight[1] < rect2TopLeft[1] || rect2BottomRight[1] < rect1TopLeft[1]) {
		return false;
	}

	return true;
}

/**
 * Check if given point is within the boundaries of a rectangle
 * @param  {Array} rectangle [description]
 * @param  {Array} point     [description]
 * @return {Boolean}           [description]
 */
function pointIsInRectangle(rectangle, point) {
	if (point[0] >= rectangle[0] && point[0] <= rectangle[0] + 16 
		&& point[1] >= rectangle[1] && point[1] <= rectangle[1] + 16) {
		return true;
	}
	return false;
}

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
		//Check if the character is moving anywhere

		//If the player is moving but not attacking and not getting knocked back
		if (this.isMoving && !this.isAttacking && !this.isMovingInvolunteraly) {
			this.move(dt);
		}
		//Otherwise if the player is getting knocked back
		if (this.isMovingInvolunteraly) {
			this.moveInvolunteraly(dt);
		}

		//Check if the character is in contact with any projectile
		if (!this.isInvincible) {

			var myPosition = this.getWorldPosition();
			var self = this;
			//Check for collision with projectiles
			for (var key in this.world.players) {
				if (key === this.id) {
					continue;
				}
				var otherPlayer = this.world.players[key];
				otherPlayer.projectiles.forEach(function(projectile) {
					if (rectanglesOverlap(projectile.getWorldPosition(), myPosition)) {
						self.getHit(projectile);
					}
				});
			}

		}

	}

	move(dt) {
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
		var collision = this.checkCollisionWithWorldObjects(newPosition);

		//Check collision with other players
		if (!collision) {
			collision = this.checkCollisionWithOtherPlayers(newPosition);
		}

		

		//If there was no collision with anything, we apply the new position to the player and emit a change event
		if (!collision) {
			this.position = newPosition;
			this.events.emit("change");
		}
	}

	moveInvolunteraly(dt) {
		var newPosition = [this.position[0], this.position[1]];
		var distance = this.knockback.speed * dt / 1000;
		switch(this.knockback.direction) {
			
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
		var collision = this.checkCollisionWithWorldObjects(newPosition);

		//Check collision with other players
		// if (!collision) {
		// 	collision = this.checkCollisionWithOtherPlayers(newPosition);
		// }

		//If there was no collision with anything, we apply the new position to the player and emit a change event
		if (!collision) {
			this.position = newPosition;
			this.events.emit("change");
		}
	}

	checkCollisionWithOtherPlayers(newPosition) {
		var collision = false;
		//We actually check both points on the directional edge, not just its center
		var checkPoint1, checkPoint2;			
		if (this.direction === UP) {
			checkPoint1 = [newPosition[0] - 8, newPosition[1] - 16];
			checkPoint2 = [newPosition[0] + 8, newPosition[1] - 16];
		}
		if (this.direction === LEFT) {
			checkPoint1 = [newPosition[0] - 8, newPosition[1]];
			checkPoint2 = [newPosition[0] - 8, newPosition[1] - 16];
		}

		if (this.direction === RIGHT) {
			checkPoint1 = [newPosition[0] + 8, newPosition[1]];
			checkPoint2 = [newPosition[0] + 8, newPosition[1] - 16];
		}

		if (this.direction === DOWN) {
			checkPoint1 = [newPosition[0] - 8, newPosition[1]];
			checkPoint2 = [newPosition[0] + 8, newPosition[1]];
		}


		for (var key in this.world.players) {
			var otherPlayer = this.world.players[key];
			if (otherPlayer.id !== this.id) {
				var otherPlayerPosition = [otherPlayer.position[0] - 8, otherPlayer.position[1] - 16];
				if (pointIsInRectangle(otherPlayerPosition, checkPoint1) || pointIsInRectangle(otherPlayerPosition, checkPoint2)) {
					collision = true;
				}
			}
		}

		return collision;
	}

	checkCollisionWithWorldObjects(newPosition) {
		var collision = false;
		var map = this.world.map.objects;

		var checkPosition = [newPosition[0], newPosition[1]];

		//Modify the point we check against based where we are facing
		if (this.direction === UP) {
			checkPosition[1] -= 8;
		}

		if (this.direction === RIGHT) {
			checkPosition[0] += 8;
			checkPosition[1] -= 8;
		}

		if (this.direction === LEFT) {
			checkPosition[0] -= 8;
			checkPosition[1] -= 8;
		}

		//Check if there is an object on the grid we are about to go to
		var targetGrid = [Math.floor(checkPosition[0] / 16), Math.floor(checkPosition[1] / 16)];

		if (targetGrid[0] >= map.length) {
			collision = true;
		}
		if (targetGrid[0] < 0) {
			collision = true;
		}
		if (targetGrid[1] >= map[0].length) {
			collision = true;
		}
	 	if (targetGrid[1] < 0) {
	 		collision = true;
	 	}

	 	if (!map[targetGrid[0]] || !map[targetGrid[0]][targetGrid[1]]) {
	 		collision = true;
	 	} else if (!map[targetGrid[0]][targetGrid[1]].passable) {
			collision = true;
		}

		return collision;
	}

	/**
	 * Creates an object representation that can be sent back via sockets
	 */
	getObject() {
		return {
			id: this.id,
			position: this.position,
			direction: this.direction,
			type: this.type,
			isMoving: this.isMoving,
			isAttacking: this.isAttacking,
			isInvincible: this.isInvincible
		}
	}
	/**
	 * Called when you get hit by a projectile
	 * @return {[type]} [description]
	 */
	getHit(projectile) {
		var self = this;
		//Can't be hit again for a short time
		this.isInvincible = true;
		setTimeout(function() {
			self.isInvincible = false;
			self.events.emit("change");
		}, 500);
		//Get knocked back
		this.isMovingInvolunteraly = true;
		this.knockback = {
			speed: 150,
			direction: projectile.direction
		};
		setTimeout(function() {
			self.isMovingInvolunteraly = false;
		}, 300);

		this.events.emit("change");
	}

};



module.exports = GameObjectServerImplementation;