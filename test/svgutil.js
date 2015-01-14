/*global _, $, MAPJS, jQuery*/
$.fn.copyStyle = function (domNode) {
	'use strict';
	if (!this[0])  { return; } /* children without a role */
	var self = this, domStyle = window.getComputedStyle(domNode), currentStyle = window.getComputedStyle(this[0]);
	_.each(domStyle, function (prop) {
		if (domStyle[prop] !== currentStyle[prop]) {
			self.css(prop, domStyle[prop]);
		}
	});
	return self;
};
$.fn.cloneAndStyle = function () {
	'use strict';
	var result= $();
	this.each(function () {
		var domNode = this,
		domClone = $(domNode).clone().attr('class', '').copyStyle(domNode);
	result = result.add(domClone);
	});
	return result;
};
$.fn.toSVG = function () {
	'use strict';
	var source = this,
			offset = {
				x: source.data('offsetX'),
				y: source.data('offsetY')
			},
			result = MAPJS.createSVG().attr({'width': source.data('width'), 'height': source.data('height')});


	source.find('svg').each(function () {
		var objectToClone = $(this),
		clone = MAPJS.createSVG('g').appendTo(result);
	clone.attr('transform', 'translate(' + (offset.x + objectToClone.position().left)+',' + (offset.y + objectToClone.position().top) +')');
		objectToClone.children().cloneAndStyle().appendTo(clone);
		});
	source.find('.mapjs-node').each(function () {
		var objectToClone = $(this),
			clone = MAPJS.createSVG('rect').appendTo(result),
			data = objectToClone.data(),
		  domStyle = window.getComputedStyle(this),
			radius = parseInt(domStyle.borderRadius, 10);
		clone.attr({x: offset.x + data.x, y:  offset.y + data.y, width: data.width, height: data.height, rx: radius, ry: radius}).
		css({fill: domStyle.backgroundColor, stroke: domStyle.borderColor, 'stroke-width': domStyle.borderWidth});
	});
/*
	domContainer = jQuery(document.createElementNS('http://www.w3.org/1999/xhtml', 'div')).attr('id','domcontainer');
	MAPJS.createSVG('foreignObject').attr({'width': '100%','height': '100%'}).appendTo(result).append(domContainer);
	source.children().not('svg').each(function () {
		var objectToClone = $(this),
		clone = objectToClone.clone().attr({class: '', id:''}).appendTo(domContainer).copyStyle(this);
	objectToClone.children().each(function () {
		var role = this.getAttribute('data-mapjs-role');
		clone.find('[data-mapjs-role=' + role + ']').copyStyle(this);
	});
	clone.css({'left': (objectToClone.data('x') + offset.x), 'top': objectToClone.data('y') + offset.y});
	});*/
	return result[0];
};
$('[role=show]').click(function() {
	'use strict';
	$('[tab]').hide();
	$('[tab=' + this.getAttribute('target') + ']').show();
});
$('[role=convert]').click(function () {
	'use strict';
	var	domURL = window.URL || window.webkitURL || window,
		toSvgBlob = function (svgElement) {
			var	svgString = new XMLSerializer().serializeToString(svgElement);
			return new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
		},
		toCanvas = function (img) {
			var canvas = $('<canvas>').attr({width: img.width, height: img.height})[0];
			canvas.getContext('2d').drawImage(img, 0, 0);
			return canvas;
		},
		toPixel = function (cssString, relativeTo) {
			var value = parseInt(cssString, 10);
			if (/[0-9]+%/.test(cssString)){
				return relativeTo * value / 100;
			}
			return value;
		},
		paintNodeImages = function (stage, canvas) {
			var result = jQuery.Deferred(),
				promises = [],
				ctx = canvas.getContext('2d'),
				offset = {
						x: stage.data('offsetX'),
						y: stage.data('offsetY')
				};
			stage.find('.mapjs-node').each(function () {
				var node = $(this),
						data = node.data(),
					  domStyle = window.getComputedStyle(this),
						bgImage = domStyle.backgroundImage,
						promise,
						img;
				if (/url\(/.test(bgImage)) { //todo:check for data url, not just url
					img = new Image();
					promise = jQuery.Deferred();
					promises.push(promise);


					img.onload = function () {
						var imgSize = domStyle.backgroundSize.split(' '),
								shownWidth = toPixel(imgSize[0], data.width),
								shownHeight = toPixel(imgSize[1], data.height);
						ctx.drawImage(img,
							offset.x + data.x + toPixel(domStyle.backgroundPositionX, data.width - shownWidth),
							offset.y + data.y + toPixel(domStyle.backgroundPositionY, data.height - shownHeight),
							shownWidth,
							shownHeight
						);
						promise.resolve();
					};
					img.src =	bgImage.substr(4, bgImage.length -5);
				}
			});
			$.when.apply($, promises).then(result.resolve, result.reject, result.notify);
			return result;
		},
		stage = $('[data-mapjs-role=stage]'),
		svg = stage.toSVG(),
		svgBlob = toSvgBlob(svg),
		pngCreated = jQuery.Deferred(),
		createPng = function () {
			domURL.revokeObjectURL(svgBlob);
			canvas = toCanvas(intermediateImg);
			paintNodeImages(stage, canvas).done(function () {
				console.log('done');
				png = canvas.toDataURL('image/png');
				pngCreated.resolve(png);
			});
		},
		intermediateImg = new Image(),
		canvas, png;
	intermediateImg.onload = createPng;
	intermediateImg.src = domURL.createObjectURL(svgBlob);
	pngCreated.done(function () {
		$('[tab=svg]').empty().append(svg);
		$('[tab=intermediate-img]').empty().append(intermediateImg);
		$('[tab=canvas]').empty().append(canvas);
		$('[tab=png]').empty().html('<img src="'+png+'"/>');
	});
});
