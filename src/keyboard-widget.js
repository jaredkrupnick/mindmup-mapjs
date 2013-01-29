/*global jQuery*/
jQuery.fn.keyboardWidget = function (mapModel) {
	'use strict';
	return this.each(function () {
		var element = jQuery(this),
			keyboardEventHandlers = {
				13: mapModel.addSiblingIdea.bind(mapModel, 'keyboard'),
				8: mapModel.removeSubIdea.bind(mapModel, 'keyboard'),
				9: mapModel.addSubIdea.bind(mapModel, 'keyboard'),
				37: mapModel.selectNodeLeft.bind(mapModel, 'keyboard'),
				38: mapModel.selectNodeUp.bind(mapModel, 'keyboard'),
				39: mapModel.selectNodeRight.bind(mapModel, 'keyboard'),
				40: mapModel.selectNodeDown.bind(mapModel, 'keyboard'),
				46: mapModel.removeSubIdea.bind(mapModel, 'keyboard'),
				32: mapModel.editNode.bind(mapModel, 'keyboard')
			},
			onKeydown = function (evt) {
				var eventHandler = keyboardEventHandlers[evt.which];
				if (eventHandler) {
					eventHandler();
					evt.preventDefault();
				}
			};
		jQuery(element).keydown(onKeydown);
		mapModel.addEventListener('inputEnabledChanged', function (isInputEnabled) {
			element[isInputEnabled ? 'bind' : 'unbind']('keydown', onKeydown);
		});
	});
};
