var GameObject = require("./GameObject");

var UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3;

class Projectile extends GameObject {
	constructor(params) {
		super(params);
		var self = this;
		this.owner = params.owner;
		this.isAttached = params.isAttached;
		setTimeout(function() {
			self.disappear();
		}, params.duration);
	}
	disappear() {
		//Remove object from world
		this.owner.removeSword(this);
	}
	update(dt) {
		if (this.isAttached && (this.owner.isMoving || this.owner.isMovingInvoluntarily)) {
			var swordPosition = [this.owner.position[0], this.owner.position[1]];
			switch(this.owner.direction) {
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

			this.position = swordPosition;
			this.owner.events.emit("projectile:change", this);
		} else {
			super.update(dt);
		}
	}
}

module.exports = Projectile;