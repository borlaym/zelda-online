var ObjectTypes = require("../shared/ObjectTypes.js");
var EventEmitter = require("events").EventEmitter;

class Pickup {
	constructor(world) {
		this.world = world;
		this.type = ObjectTypes.HEART_CONTAINER;
		this.events = new EventEmitter;
		var space = this.world.getEmptySpace();
		this.position = [space[0] * 16 + 8, space[1] + 8];
	}
	getObject() {
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