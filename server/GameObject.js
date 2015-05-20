var GameObject = require("../shared/GameObject.js");
var ObjectTypes = require("../shared/ObjectTypes.js");
var Actions = require("../shared/Actions.js");
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
		this.room = attributes.room;
		this.states = {
			ALIVE: 1,
			DEAD: 0
		}
		this.state = this.states.ALIVE;
	}
	
	update(dt) {

		//Check if dead
		if (this.state === this.states.DEAD) {
			return;
		}

		//Check if the character is moving anywhere

		//If the player is moving but not attacking and not getting knocked back
		if (this.isMoving && !this.isAttacking && !this.isMovingInvoluntarily) {
			this.move(dt);
		}
		//Otherwise if the player is getting knocked back
		if (this.isMovingInvoluntarily) {
			this.moveInvoluntarily(dt);
		}

		//Check if the character is in contact with any projectile
		if (!this.isInvincible && this.type === ObjectTypes.PLAYER_LINK) {

			var myPosition = this.getWorldPosition();
			var self = this;
			//Check for collision with projectiles
			for (let player of this.room.players) {
				if (player === this) {
					continue;
				}
				player.projectiles.forEach(function(projectile) {
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
			this.world.io.to(this.room.id).emit(Actions.OBJECT_UPDATE, this.getState());
		}
	}

	moveInvoluntarily(dt) {
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
			this.world.io.to(this.room.id).emit(Actions.OBJECT_UPDATE, this.getState());
		}
	}
	/**
	 * Check collision with other players, using two points along the edge where the character faces
	 * @param  {[type]} newPosition [description]
	 * @return {[type]}             [description]
	 */
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


		for (let player of this.room.players) {
			if (player !== this) {
				var playerPosition = [player.position[0] - 8, player.position[1] - 16];
				if ((pointIsInRectangle(playerPosition, checkPoint1) || pointIsInRectangle(playerPosition, checkPoint2)) && player.state)  {
					collision = true;
				}
			}
		}

		return collision;
	}

	/**
	 * Checks one point on the edge where the character is facing
	 * @param  {[type]} newPosition [description]
	 * @return {[type]}             [description]
	 */
	checkCollisionWithWorldObjects(newPosition) {
		var collision = false;
		var room = this.room.objects;

		var checkPoint1, checkPoint2;

		var directionToCheck = this.isMovingInvoluntarily ? this.knockback.direction : this.direction;

		//Modify the point we check against based where we are facing
		if (directionToCheck === UP) {
			checkPoint1 = [newPosition[0] - 7, newPosition[1] - 7];
			checkPoint2 = [newPosition[0] + 7, newPosition[1] - 7];
		}

		if (directionToCheck === RIGHT) {
			checkPoint1 = [newPosition[0] + 7, newPosition[1] - 7];
			checkPoint2 = [newPosition[0] + 7, newPosition[1]];
		}

		if (directionToCheck === DOWN) {
			checkPoint1 = [newPosition[0] + 7, newPosition[1]];
			checkPoint2 = [newPosition[0] - 7, newPosition[1]];
		}

		if (directionToCheck === LEFT) {
			checkPoint1 = [newPosition[0] - 7, newPosition[1] - 7];
			checkPoint2 = [newPosition[0] - 7, newPosition[1]];
		}

		//Check if there is an object on the grid we are about to go to
		var targetGrid = [Math.floor(checkPoint1[0] / 16), Math.floor(checkPoint1[1] / 16)];

	 	if (!room[targetGrid[0]] || !room[targetGrid[0]][targetGrid[1]]) {
	 		collision = true;
	 	} else if (!room[targetGrid[0]][targetGrid[1]].passable) {
			collision = true;
		}

		var targetGrid = [Math.floor(checkPoint2[0] / 16), Math.floor(checkPoint2[1] / 16)];

	 	if (!room[targetGrid[0]] || !room[targetGrid[0]][targetGrid[1]]) {
	 		collision = true;
	 	} else if (!room[targetGrid[0]][targetGrid[1]].passable) {
			collision = true;
		}

		return collision;
	}

	/**
	 * Creates an object representation that can be sent back via sockets
	 */
	getState() {
		return {
			id: this.id,
			position: this.position,
			direction: this.direction,
			type: this.type,
			isMoving: this.isMoving,
			isAttacking: this.isAttacking,
			isInvincible: this.isInvincible,
			name: this.name,
			state: this.state,
			health: this.health
		}
	}
	/**
	 * Called when you get hit by a projectile
	 * @return {[type]} [description]
	 */
	getHit(projectile) {
		var self = this;
		//Damage
		this.health = this.health - projectile.damage;
		if (this.health <= 0) {
			this.die();
			projectile.owner.takePointsFrom(this);
			return;
		}
		//Can't be hit again for a short time
		this.isInvincible = true;
		setTimeout(function() {
			self.isInvincible = false;
			self.world.io.to(self.room.id).emit(Actions.OBJECT_UPDATE, self.getState());
		}, 500);
		
		this.getKnockedBack({
			speed: 150,
			direction: projectile.direction,
			duration: 300
		});

		self.world.io.to(self.room.id).emit(Actions.OBJECT_UPDATE, self.getState());
	}

	/**
	 * Get knocked back, unable to move voluntarily
	 */
	getKnockedBack(settings) {
		var self = this;
		//Get knocked back
		this.isMovingInvoluntarily = true;
		this.knockback = {
			speed: settings.speed,
			direction: settings.direction
		};
		setTimeout(function() {
			self.isMovingInvoluntarily = false;
		}, settings.duration);

	}

	

	die() {
		this.state = this.states.DEAD;
		this.world.io.to(this.room.id).emit(Actions.OBJECT_UPDATE, this.getState());

		//respawn
		var self = this;
		setTimeout(function() {
			self.state = self.states.ALIVE;
			self.spawn();
			self.world.io.to(self.room.id).emit(Actions.OBJECT_UPDATE, self.getState());
		}, 3000);
	}

};



module.exports = GameObjectServerImplementation;