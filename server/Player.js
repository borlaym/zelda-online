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
 * A game object that is controlled by a human player
 */
class Player extends GameObject {
	constructor(attributes) {
		super(attributes);
		this.socket = attributes.socket;
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
		this.isMoving = true;
		this.direction = data;
	}
	stopMoving() {
		this.isMoving = false;
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
		this.events.emit("change");

		//Spawn sword object
		this.spawnSword();


		var self = this;
		setTimeout(function() {
			self.isAttacking = false;
			self.events.emit("change");
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
			damage: 1,
			world: this.world
		});

		this.projectiles.push(sword);

		this.events.emit("projectileSpawned", sword);

	}

	removeSword(swordInstance) {
		this.projectiles = _.filter(function(item) {
			return item !== swordInstance;
		});
		this.events.emit("projectileRemoved", swordInstance);
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
}

module.exports = Player;