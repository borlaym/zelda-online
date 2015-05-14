var ObjectTypes = require("../shared/ObjectTypes.js");
var EventEmitter = require("events").EventEmitter;

class Pickup {
	constructor(room) {
		this.room = room;
		this.type = ObjectTypes.HEART_CONTAINER;
		this.events = new EventEmitter;
		var space = this.room.getEmptySpace();
		this.position = [space[0] * 16 + 8, space[1] + 8];
	}
	getState() {
		return {
			position: this.position,
			type: this.type
		}
	}
	destroy() {
		this.events.emit("destroy", this);
	}
}

module.exports = Pickup;