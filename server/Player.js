var GameObject = require("./GameObject");
var Actions = require("../shared/Actions.js");

/**
 * A game object that is controlled by a human player
 */
class Player extends GameObject {
	constructor(attributes) {
		super(attributes);
		this.socket = attributes.socket;
		this.socket.on(Actions.START_MOVING, this.startMoving.bind(this));
		this.socket.on(Actions.STOP_MOVING, this.stopMoving.bind(this));
		this.socket.on(Actions.ATTACK, this.attack.bind(this));
		this.lastHeartbeat = new Date().getTime();
		this.socket.on(Actions.HEARTBEAT, this.heartbeat.bind(this));
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
	}
	attack() {
		this.isAttacking = true;
		this.events.emit("change");

		var self = this;
		setTimeout(function() {
			self.isAttacking = false;
			self.events.emit("change");
		}, 200);
	}
}

module.exports = Player;