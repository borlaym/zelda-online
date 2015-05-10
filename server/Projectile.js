var GameObject = require("./GameObject");

class Projectile extends GameObject {
	constructor(params) {
		super(params);
		var self = this;
		this.owner = params.owner;
		setTimeout(function() {
			self.disappear();
		}, params.duration);
	}
	disappear() {
		//Remove object from world
		this.owner.removeSword(this);
	}
}

module.exports = Projectile;