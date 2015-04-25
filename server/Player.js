var GameObject = require("./GameObject");
var Actions = require("../shared/Actions.js");

/**
 * A game object that is controlled by a human player
 */
class Player extends GameObject {
	constructor(attributes) {
		super(attributes);
		this.socket = attributes.socket;
		this.socket.on(Actions.START_MOVING, this.startMoving);
		this.socket.on(Actions.STOP_MOVING, this.stopMoving);
	}
	startMoving(data) {
		
	}
	stopMoving(data) {
		
	}
}

module.exports = Player;