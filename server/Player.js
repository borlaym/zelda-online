var GameObject = require("./GameObject");
var Projectile = require("./Projectile");
var Actions = require("../shared/Actions.js");
var ObjectTypes = require("../shared/ObjectTypes.js");
var _ = require("lodash");

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
function rectanglesOverlap (rect1TopLeft, rect2TopLeft, rect1Dimensions, rect2Dimensions) {
	rect1Dimensions = rect1Dimensions || [16, 16];
	rect2Dimensions = rect2Dimensions || [16, 16];
	var rect1BottomRight = [rect1TopLeft[0] + rect1Dimensions[0], rect1TopLeft[1] + rect1Dimensions[1]];
	var rect2BottomRight = [rect2TopLeft[0] + rect2Dimensions[0], rect2TopLeft[1] + rect2Dimensions[1]];

	if (rect1BottomRight[0] < rect2TopLeft[0] || rect2BottomRight[0] < rect1TopLeft[0]) {
		return false;
	}

	if (rect1BottomRight[1] < rect2TopLeft[1] || rect2BottomRight[1] < rect1TopLeft[1]) {
		return false;
	}

	return true;
}


/**
 * A game object that is controlled by a human player
 */
class Player extends GameObject {
	constructor(attributes) {
		attributes.type = ObjectTypes.PLAYER_LINK;
		super(attributes);
		this.socket = attributes.socket;
		this.socket.player = this;
		var self = this;
		this.socket.on(Actions.JOIN, function(data) {
			self.name = data.name;
		});
		this.socket.on(Actions.START_MOVING, this.startMoving.bind(this));
		this.socket.on(Actions.STOP_MOVING, this.stopMoving.bind(this));
		this.socket.on(Actions.ATTACK, this.attack.bind(this));
		this.lastHeartbeat = new Date().getTime();
		this.socket.on(Actions.HEARTBEAT, this.heartbeat.bind(this));
		this.projectiles = [];
	}
	startMoving(data) {
		if (!this.isMovingInvoluntarily && !this.isAttacking && this.state) {
			this.isMoving = true;
			this.direction = data;
		}
	}
	stopMoving() {
		this.isMoving = false;
		this.socket.to(this.room.id).emit(Actions.OBJECT_UPDATE, this.getState());
		this.socket.emit(Actions.OBJECT_UPDATE, this.getState());
	}
	update(dt) {
		super.update(dt);
		// var pickups = this.world.items;
		// for (var i = 0; i < pickups.length; i++) {
		// 	var pickupPosition = [pickups[i].position[0] - 3.5, pickups[i].position[1] - 4];
		// 	if (rectanglesOverlap(this.getWorldPosition(), pickupPosition, [16,16], [7, 8])) {
		// 		this.health = Math.min(3, this.health + 1);
		// 		pickups[i].destroy();
		// 	}
		// }
		// 
		// 

		if ((this.position[0] <= 16 && this.direction === LEFT) ||
			(this.position[0] >= 246 && this.direction === RIGHT) ||
			(this.position[1] <= 16 && this.direction === UP) ||
			(this.position[1] >= 166 && this.direction === DOWN))
		{
			var room = this.world.getAdjacentRoom(this.room, this.direction);
			if (room) {
				this.events.emit("room:transition", room)
			}
			
		}
	}
	transitionToRoom(room) {
		this.room = room;
		switch(this.direction) {
			case UP:
				this.position[1] = 176;
				break;
			case RIGHT:
				this.position[0] = 0;
				break;
			case DOWN:
				this.position[1] = 0;
				break;
			case LEFT:
				this.position[0] = 256;
				break;
		}
		this.events.emit("change");
	}
	heartbeat() {
		this.lastHeartbeat = new Date().getTime();
		this.socket.emit(Actions.HEARTBEAT);
	}
	attack() {
		if (this.projectiles.length !== 0) {
			return;
		}
		this.isAttacking = true;
		this.socket.to(this.room.id).emit(Actions.OBJECT_UPDATE, this.getState());
		this.socket.emit(Actions.OBJECT_UPDATE, this.getState());

		//Spawn sword object
		this.spawnSword();


		var self = this;
		setTimeout(function() {
			self.isAttacking = false;
			self.socket.to(self.room.id).emit(Actions.OBJECT_UPDATE, self.getState());
			self.socket.emit(Actions.OBJECT_UPDATE, self.getState());
		}, 200);
	}

	spawnSword() {

		var swordPosition = [this.position[0], this.position[1]];
		switch(this.direction) {
			case UP:
				swordPosition[1] -= 16;
				break;
			case RIGHT: {
				swordPosition[0] += 16;
				break;
			}
			case DOWN:
				swordPosition[1] += 16;
				break;
			case LEFT:
				swordPosition[0] -=16;
				break;
		}

		var sword = new Projectile({
			type: ObjectTypes.SWORD,
			direction: this.direction,
			position: swordPosition,
			isMoving: false,
			isAttached: true,
			speed: 0,
			duration: 200,
			owner: this,
			id: this.id + "sword",
			damage: 0.5,
			world: this.world
		});

		this.projectiles.push(sword);

		this.socket.to(this.room.id).emit(Actions.ADD_OBJECT, sword.getState());
		this.socket.emit(Actions.ADD_OBJECT, sword.getState());

	}

	removeSword(swordInstance) {
		this.projectiles = _.filter(function(item) {
			return item !== swordInstance;
		});
		this.socket.to(this.room.id).emit(Actions.REMOVE_OBJECT, swordInstance.id);
		this.socket.emit(Actions.REMOVE_OBJECT, swordInstance.id);
		this.socket.emit(Actions.REMOVE_OBJECT, swordInstance.id);
	}

	spawn() {
		var respawnPoint = this.room.getEmptySpace();
		this.position = [respawnPoint[0] * 16 + 8, respawnPoint[1] * 16 + 16];
		this.health = 3;
		//Send my new spawn position to everyone in my room
		this.socket.to(this.room.id).emit(Actions.OBJECT_UPDATE, this.getState());
		this.socket.emit(Actions.OBJECT_UPDATE, this.getState());
	}

	/**
	 * Enter a new room. Includes:
	 * Remove from old room
	 * Create in new Room
	 * @return {[type]} [description]
	 */
	enterRoom(room) {
		if (this.room) {
			this.socket.broadcast.to(this.room.id).emit(Actions.REMOVE_OBJECT, this.id);
			this.socket.leave(this.room.id);
			this.room.players.delete(this);
		}
		this.room = room;
		this.socket.join(this.room.id);
		this.room.players.add(this);
		//I get the initial state of the room
		this.socket.emit(Actions.INITIAL_STATE, this.room.getState());
		//The others see me appear
		this.socket.broadcast.to(this.room.id).emit(Actions.ADD_OBJECT, this.getState());
	}

	getHit(projectile) {
		//Check if we are facing the direction of the projectile
		//If we do, we block the attack!
		if (
			(this.direction === UP && projectile.direction === DOWN) ||
			(this.direction === DOWN && projectile.direction === UP) ||
			(this.direction === LEFT && projectile.direction === RIGHT) ||
			(this.direction === RIGHT && projectile.direction === LEFT)
		) {
			//The attacking player gets knocked back
			projectile.owner.getKnockedBack({
				speed: 150,
				duration: 100,
				direction: this.direction
			})
			return;
		}
		super.getHit(projectile);
	}
	/**
	 * Remove yourself from the server after a disconnect
	 */
	remove() {
		this.socket.broadcast.to(this.room.id).emit(Actions.REMOVE_OBJECT, this.id);
		this.room.players.delete(this);
	}
}

module.exports = Player;