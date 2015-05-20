var ObjectTypes = require("../shared/ObjectTypes.js");
var EventEmitter = require("events").EventEmitter;

class Pickup {
	constructor(room) {
		this.room = room;
		this.type = Math.random() < 0.5 ? ObjectTypes.HEART_CONTAINER : ObjectTypes.RUPEE;
		this.events = new EventEmitter;
		var space = this.room.getEmptySpace();
		this.position = [space[0] * 16 + 8, space[1] * 16 + 8];
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