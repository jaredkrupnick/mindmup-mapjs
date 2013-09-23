/*global _, jQuery, MAPJS*/
jQuery.fn.miniMapWidget = function (mapModel, stage, drawDelay) {
	'use strict';
	
	var element = jQuery(this),
		inset = 5,
		timeoutId,
		getViewPort = function () {
			var scale = stage.getScaleX(),
				viewPort = _.extend({}, stage.getSize(), stage.getPosition());
			timeoutId = undefined;
			viewPort.width = (viewPort.width - (inset * 2)) / scale;
			viewPort.height = (viewPort.height - (inset * 2)) / scale;
			viewPort.x =  ((-1 * viewPort.x) + inset) / scale;
			viewPort.y = ((-1 * viewPort.y) + inset) / scale;
			return viewPort;
		},
		updateMiniMap = function () {
			MAPJS.pngExport(mapModel.getIdea(), getViewPort(stage, 2)).then(function (contents) { element.attr('src', contents); });
		},
		scheduleMapRedraw = function () {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(updateMiniMap, drawDelay);
		};
	drawDelay = drawDelay || 500;

	mapModel.addEventListener('mapMoveRequested nodeCreated nodeTitleChanged nodeSelectionChanged', scheduleMapRedraw);
	stage.on('dragend', scheduleMapRedraw);
	stage.on(':scaleChangeComplete', scheduleMapRedraw);
	
	scheduleMapRedraw();
	element.on('click', function (evt) {
		var	layout = MAPJS.calculateLayout(mapModel.getIdea(), MAPJS.KineticMediator.dimensionProvider),
			frame = MAPJS.calculateFrame(layout.nodes, 10),
			imageSize = {width: element.width(), height: element.height()},
			stagePosition = stage.getPosition(),
			imageScale = {scaleX: imageSize.width / frame.width, scaleY: imageSize.height / frame.height},
			newPos = {x: evt.offsetX - (0.5 * imageSize.width), y: evt.offsetY - (0.5 * imageSize.width)};
		console.log('click', 'newPos', newPos);
		console.log('imageSize', imageSize);
		console.log('imageScale', imageScale);
		console.log('stagePosition', stagePosition);
		console.log('evt',  evt);

	});
	return element;
};
