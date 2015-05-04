var WorldObject = require("../../shared/WorldObject.js");
var ObjectTypes = require("../../shared/ObjectTypes.js");
var spriteHandler = require("./spriteHandlers/overWorld.js");

class WorldObjectClientImplementation extends WorldObject {
	getSprite() {
		return spriteHandler.sprites[this.type];
	}
	draw(ctx) {
		var drawPosition = this.getPosition();
		ctx.drawImage(spriteHandler.image, 
						this.getSprite()[0], 
						this.getSprite()[1], 
						spriteHandler.WIDTH, 
						spriteHandler.HEIGHT, 
						drawPosition[0], 
						drawPosition[1], 
						spriteHandler.WIDTH, 
						spriteHandler.HEIGHT);
	}
}

module.exports = WorldObjectClientImplementation;