var $ = require("zepto-browserify").$;
var ObjectTypes = require("../../shared/ObjectTypes.js");

module.exports = {
	drawMap: function(data) {
		var html = "<table>";
		for (var i = 0; i < data.length; i++) {
			html += "<tr>";
			for (var j = 0; j < data[i].length; j++) {
				html += "<td></td>"
			}
			html += "</tr>"
		}
		html +="</table>";
		$(".map").html(html);
	},
	currentRoom: function(pos) {
		console.log($(".map tr").length);
		$(".map td").removeClass("current");
		$(".map tr").eq(pos[1]).find("td").eq(pos[0]).addClass("current");
	},
	updateRupees: function(amount) {
		$(".rupees span").text(amount);
	},
	updateBombs: function(amount) {
		$(".bombs span").text(amount);
	},
	updateLife: function(amount) {
		$(".life .containers").html("");
		var fullContainers = Math.floor(amount);
		for (var i = 0; i < fullContainers; i++) {
			$(".life .containers").append("<img src='images/heart.png'>");
		}
		if (fullContainers < amount) {
			$(".life .containers").append("<img src='images/half-heart.png'>");
		}
		var emptyContainers = 3 - Math.ceil(amount);
		for (var i = 0; i < emptyContainers; i++) {
			$(".life .containers").append("<img src='images/heart_empty.png'>");
		}
	},
	swordType : 0,
	updateSword: function(type) {
		if (type === this.swordType) {
			return;
		}
		if (type === 1) {
			$(".equipment .A").html("<div class='masterSword'></div>");
		} else {
			$(".equipment .A").html("<div class='sword'></div>");
		}
		this.swordType = type;
	},
	updateHeldItem: function(type) {
		if (type === ObjectTypes.BOMB) {
			$(".equipment .B").html("<div class='bomb-item'></div>");
		}
	}
}