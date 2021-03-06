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
		this.socket.on(Actions.SPECIAL, this.special.bind(this));
		this.lastHeartbeat = new Date().getTime();
		this.socket.on(Actions.HEARTBEAT, this.heartbeat.bind(this));
		this.projectiles = [];
		this.swordType = 0.5;
		this.rupees = 0;
		this.bombs = 0;
		this.currentItem = "";
		this.canUseSpecial = true;
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

		//Check if the player is colliding with a pickup
		var pickups = this.room.pickups;
		for (var i = 0; i < pickups.length; i++) {
			var pickupPosition = [pickups[i].position[0] - 3.5, pickups[i].position[1] - 4];
			if (rectanglesOverlap(this.getWorldPosition(), pickupPosition, [16,16], [7, 8])) {
				if (pickups[i].type === ObjectTypes.HEART_CONTAINER) {
					this.health = Math.min(3, this.health + 1);
				}
				if (pickups[i].type === ObjectTypes.RUPEE) {
					this.addPoints(1);
				}
				if (pickups[i].type === ObjectTypes.MASTER_SWORD) {
					this.swordType = 1;
				}
				if (pickups[i].type === ObjectTypes.BOMB) {
					this.bombs += 3;
					if (this.bombs > 9) {
						this.bombs = 9;
					}
					this.currentItem = ObjectTypes.BOMB;
				}
				pickups[i].destroy();
			}
		}
		
		
		//Check room transition
		if ((this.position[0] <= 16 && this.direction === LEFT) ||
			(this.position[0] >= 246 && this.direction === RIGHT) ||
			(this.position[1] <= 16 && this.direction === UP) ||
			(this.position[1] >= 166 && this.direction === DOWN))
		{
			var room = this.world.getAdjacentRoom(this.room, this.direction);
			if (room) {
				this.enterRoom(room);
				this.transitionToRoom(room);
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
		this.socket.to(this.room.id).emit(Actions.OBJECT_UPDATE, this.getState());
		this.socket.emit(Actions.OBJECT_UPDATE, this.getState());
	}
	heartbeat() {
		this.lastHeartbeat = new Date().getTime();
		this.socket.emit(Actions.HEARTBEAT);
	}
	attack() {
		var isAttackingWithSword = _.find(this.projectiles, function(projectile) {
			return projectile.type === ObjectTypes.SWORD || projectile.type === ObjectTypes.MASTER_SWORD;
		});

		if (isAttackingWithSword || this.state === 0) {
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

	/**
	 * Use a special item, like bombs or bow and arrow
	 */
	special() {
		if (!this.canUseSpecial) {
			return;
		}
		var self = this;
		this.useItem();
		
	}

	useItem() {
		switch(this.currentItem) {
			case ObjectTypes.BOMB:
				this.spawnBomb();
				break;
		}
	}

	spawnBomb() {
		if (this.bombs < 1) {
			return;
		}
		var self = this;

		var bombPosition = [this.position[0], this.position[1]];
		switch(this.direction) {
			case UP:
				bombPosition[1] -= 32;
				break;
			case RIGHT: {
				bombPosition[0] += 32;
				break;
			}
			case DOWN:
				bombPosition[1] += 32;
				break;
			case LEFT:
				bombPosition[0] -=32;
				break;
		}

		var bomb = new Projectile({
			type: ObjectTypes.BOMB,
			position: bombPosition,
			direction: UP,
			isMoving: false,
			isAttached: false,
			speed: 0,
			duration: 1500,
			owner: this,
			id: this.id + "bomb",
			damage: 0,
			world: this.world
		});

		setTimeout(function() {
			bomb.damage = 1;
			bomb.direction = RIGHT;
			self.socket.to(self.room.id).emit(Actions.OBJECT_UPDATE, bomb.getState());
			self.socket.emit(Actions.OBJECT_UPDATE, bomb.getState());
		}, 1000);

		this.projectiles.push(bomb);
		this.socket.to(this.room.id).emit(Actions.ADD_OBJECT, bomb.getState());
		this.socket.emit(Actions.ADD_OBJECT, bomb.getState());

		this.bombs--;
		this.socket.emit(Actions.OBJECT_UPDATE, this.getState());

		this.canUseSpecial = false;
		setTimeout(function() {
			self.canUseSpecial = true;
		}, 2000);
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
			type: this.swordType === 0.5 ? ObjectTypes.SWORD : ObjectTypes.MASTER_SWORD,
			direction: this.direction,
			position: swordPosition,
			isMoving: false,
			isAttached: true,
			speed: 0,
			duration: 200,
			owner: this,
			id: this.id + "sword",
			damage: this.swordType,
			world: this.world
		});

		this.projectiles.push(sword);

		this.socket.to(this.room.id).emit(Actions.ADD_OBJECT, sword.getState());
		this.socket.emit(Actions.ADD_OBJECT, sword.getState());

	}

	removeProjectile(projectileInstance) {
		this.projectiles = _.filter(function(item) {
			return item !== projectileInstance;
		});
		this.socket.to(this.room.id).emit(Actions.REMOVE_OBJECT, projectileInstance.id);
		this.socket.emit(Actions.REMOVE_OBJECT, projectileInstance.id);
		this.socket.emit(Actions.REMOVE_OBJECT, projectileInstance.id);
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

	getState() {
		var state = super.getState();
		state.currentItem = this.currentItem;
		state.bombs = this.bombs;
		return state;
	}
	die() {
		this.swordType = 0.5;
		super.die();
	}
	/**
	 * Remove yourself from the server after a disconnect
	 */
	remove() {
		this.socket.broadcast.to(this.room.id).emit(Actions.REMOVE_OBJECT, this.id);
		this.room.players.delete(this);
	}
	addPoints(amount) {
		this.events.emit("pointchange", amount);
	}
	takePointsFrom(from) {
		this.events.emit("takepointsfrom", from);
	}
}

module.exports = Player;