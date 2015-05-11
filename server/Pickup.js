var ObjectTypes = require("../shared/ObjectTypes.js");

class Pickup {
	constructor(world) {
		this.world = world;
		this.type = ObjectTypes.HEART_CONTAINER;
		var space = this.world.getEmptySpace();
		this.position = [space[0] * 16 + 8, space[1] + 8];
	}
	getObject() {
		return {
			position: this.position,
			type: this.type
		}
	}
}

module.exports = Pickup;