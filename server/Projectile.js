var GameObject = require("./GameObject");
var Actions = require("../shared/Actions.js");
var ObjectTypes = require("../shared/ObjectTypes.js");

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
		this.damage = params.damage;
		this.direction = params.direction;
		setTimeout(function() {
			self.disappear();
		}, params.duration);
	}
	disappear() {
		//Remove object from world
		this.owner.removeProjectile(this);
	}
	update(dt) {
		if (this.isAttached && (this.owner.isMoving || this.owner.isMovingInvoluntarily)) {
			var swordPosition = [this.owner.position[0], this.owner.position[1]];
			switch(this.direction) {
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
			this.owner.socket.to(this.owner.room.id).emit(Actions.OBJECT_UPDATE, this.getState());
			this.owner.socket.emit(Actions.OBJECT_UPDATE, this.getState());
		} else {
			super.update(dt);
		}
	}
	contact(player) {
		if (this.type === ObjectTypes.SWORD || this.type === ObjectTypes.MASTER_SWORD) {
			this.contactWithSword(player);
		}
		if (this.type === ObjectTypes.BOMB) {
			this.contactWithBomb(player);
		}
	}
	contactWithSword(player) {
		//Check if we are facing the direction of the projectile
		//If we do, we block the attack!
		if (
			(player.direction === UP && this.direction === DOWN) ||
			(player.direction === DOWN && this.direction === UP) ||
			(player.direction === LEFT && this.direction === RIGHT) ||
			(player.direction === RIGHT && this.direction === LEFT)
		) {
			//The attacking player gets knocked back
			this.owner.getKnockedBack({
				speed: 150,
				duration: 100,
				direction: this.direction
			})
			return;
		}
		player.getKnockedBack({
			speed: 150,
			direction: this.direction,
			duration: 300
		});
		player.getHit(this);
		
	}
	contactWithBomb(player) {
		if (!this.damage) {
			return;
		}

		player.getHit(this);

	}
}

module.exports = Projectile;