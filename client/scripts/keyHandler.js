var Actions = require("../../shared/Actions.js");

var keys = {
	UP : 87,
	LEFT : 65,
	RIGHT : 68,
	DOWN : 83,
	A: 79
}
var pressedKeys = [];

var Object = {
	handleKeydown: function(key) {
		var direction;
		switch(key) {
			case keys.UP:
				this.socket.emit(Actions.START_MOVING, 0);
				break;
			case keys.RIGHT:
				this.socket.emit(Actions.START_MOVING, 1);
				break;
			case keys.DOWN:
				this.socket.emit(Actions.START_MOVING, 2);
				break;
			case keys.LEFT:
				this.socket.emit(Actions.START_MOVING, 3);
				break;
			case keys.A:
				this.socket.emit(Actions.ATTACK, 3);
				break;
		}
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