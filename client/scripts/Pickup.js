var itemSpriteHandler = require("./spriteHandlers/items.js");

class Pickup {
	constructor(data) {
		this.position = data.position;
		this.type = data.type;
	}
	draw(ctx) {
		ctx.drawImage(itemSpriteHandler.image, 
						itemSpriteHandler.sprites[this.type][0], 
						itemSpriteHandler.sprites[this.type][1], 
						itemSpriteHandler.sprites[this.type][2], 
						itemSpriteHandler.sprites[this.type][3], 
						this.position[0] - itemSpriteHandler.sprites[this.type][2] / 2 , 
						this.position[1] - itemSpriteHandler.sprites[this.type][3] / 2, 
						itemSpriteHandler.sprites[this.type][2], 
						itemSpriteHandler.sprites[this.type][3]
		);
	}
}

module.exports = Pickup;