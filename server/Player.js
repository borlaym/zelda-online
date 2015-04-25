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
	}
	startMoving(data) {
		console.log("START ");
		this.isMoving = true;
		this.direction = data;
	}
	stopMoving() {
		console.log("STOP");
		this.isMoving = false;
		this.events.emit("change");
	}
}

module.exports = Player;