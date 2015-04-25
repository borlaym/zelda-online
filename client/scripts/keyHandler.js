var Actions = require("../../shared/Actions.js");

var keys = {
	UP : 87,
	LEFT : 65,
	RIGHT : 68,
	DOWN : 83,
}
var pressedKeys = [];

var Object = {
	handleKeydown: function(key) {
		var direction;
		switch(key) {
			case keys.UP:
				direction = 0;
				break;
			case keys.RIGHT:
				direction = 1;
				break;
			case keys.DOWN:
				direction = 2;
				break;
			case keys.LEFT:
				direction = 3;
				break;
		}
		this.socket.emit(Actions.START_MOVING, direction);
	},
	handleKeyUp: function(key) {
		if (pressedKeys.length === 0) {
			this.socket.emit(Actions.STOP_MOVING);
		}
	}
}


window.addEventListener("keydown", function(a) {
	if (pressedKeys.indexOf(a.which) === -1) {
		Object.handleKeydown(a.which);
	}
	pressedKeys.push(a.which);
	pressedKeys = _.unique(pressedKeys);
});

window.addEventListener("keyup", function(a) {
	pressedKeys = _.filter(pressedKeys, function(key) {
		return key !== a.which
	});
	Object.handleKeyUp(a.which);
});



module.exports = Object;