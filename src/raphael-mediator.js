/*global console, document, jQuery, Raphael*/
var MAPJS = MAPJS || {};
MAPJS.RaphaelMediator = function (mapModel, stage) {
	'use strict';
	var ox, oy, dragging, draggingNode, nodeByIdeaId = {};
	jQuery('#holder').mousedown(function (event) {
		if (draggingNode) {
			return;
		}
		ox = event.screenX;
		oy = event.screenY;
		dragging = true;
	}).mouseup(function (event) {
		dragging = false;
	}).mousemove(function (event) {
		if (dragging) {
			stage.setViewBox(
				stage._viewBox[0] - event.screenX + ox,
				stage._viewBox[1] - event.screenY + oy,
				stage._viewBox[2],
				stage._viewBox[3]
			);
			ox = event.screenX;
			oy = event.screenY;
		}
	});
	mapModel.addEventListener('nodeCreated', function (n) {
		var ox, oy, node = stage.text(n.x, n.y, n.title.substr(0, 20)).attr({
			font: '16px Helvetica',
			fill: '#222',
			'text-anchor': 'start',
			editable: 'simple'
		});
		nodeByIdeaId[n.id] = node;
		node.click(mapModel.selectNode.bind(mapModel, n.id));
		node.drag(function onmove(dx, dy) {
			node.attr({
				x: ox + dx,
				y: oy + dy
			});
			mapModel.nodeDragMove(
				n.id,
				ox + dx,
				oy + dy
			);
		}, function onstart() {
			ox = node.attr('x');
			oy = node.attr('y');
			draggingNode = true;
		}, function onEnd() {
			mapModel.nodeDragEnd(
				n.id,
				node.attr('x'),
				node.attr('y')
			);
			draggingNode = false;
		});
	});
	mapModel.addEventListener('nodeMoved', function (n, reason) {
		var node = nodeByIdeaId[n.id];
		node.animate({
			x: n.x,
			y: n.y
		}, 400);
	});
	mapModel.addEventListener('nodeDroppableChanged', function (ideaId, isDroppable) {
		console.log('nodeDroppableChanged', ideaId, isDroppable);
		var node = nodeByIdeaId[ideaId];
		node.attr({ fill: isDroppable ? 'red' : 'black' });
	});
	mapModel.addEventListener('nodeSelectionChanged', function (ideaId, isSelected) {
		var node = nodeByIdeaId[ideaId];
		node.attr({ fill: isSelected ? 'blue' : 'black' });
	});
};
(function () {
	'use strict';
	var stage = Raphael('holder', 0, 0);
	MAPJS.RaphaelMediator.dimensionProvider = function (title) {
		var text = stage.text(0, 0, title.substr(0, 20)).attr({
			font: '16px Helvetica',
			fill: '#222',
			opacity: 0
		});
		return {
			width: text.getBBox().width,
			height: text.getBBox().height
		};
	};
	MAPJS.RaphaelMediator.layoutCalculator = function (idea) {
		return MAPJS.calculateLayout(idea, MAPJS.RaphaelMediator.dimensionProvider);
	};
}());
