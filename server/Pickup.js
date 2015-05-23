var ObjectTypes = require("../shared/ObjectTypes.js");
var EventEmitter = require("events").EventEmitter;

class Pickup {
	constructor(room) {
		this.room = room;
		var itemType = Math.random();
		if (itemType < 0.6) {
			this.type = ObjectTypes.RUPEE;
		} else if (itemType < 0.95) {
			this.type = ObjectTypes.HEART_CONTAINER;
		} else {
			this.type = ObjectTypes.MASTER_SWORD;
		}
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