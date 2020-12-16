// Kilo Slider
// Description: Formerly Nerve Slider, Kilo Slider is a lightweight, responsive, and smooth jQuery carousel plugin
// Author: Ryan Bruzan
// Author URL: http://www.snazzii.com
// Plugin URL: http://kilo.snazzii.com

var kiloSliderVersion = "1.1";
(function($) {
	$.fn.kiloSlider = function(userOptions) {
		var options = $.extend({
			speed: "1000ms", // CSS Timing or JavaScript integer (milliseconds)
			easing: "cubic-bezier(0.19, 1, 0.22, 1)", // Any CSS easing
			interval: "3000ms", // CSS Timing or JavaScript integer (milliseconds)
			autoplay: true, // True | False
			dots: true, // True | False
			arrows: true, // True | False
			imageScaling: "fill", // "fill" | "fit",
			draggable: false, // True | False - REQUIRES jQuery UI if true
			onSlideChange: function(){} // Optional function when slide changes
		}, userOptions);

		return $(this).each(function(){
			options.speed = ks_javascriptTimingToCSS(options.speed);
			options.interval = ks_cssTimingToJavascript(options.interval);

			var slider = $(this);
			var currentSlide = 0;
			var slideCount = 0;
			slider.data("current-slide", currentSlide);

			slider.find(">img,>div").each(function(){
				slideCount++;
			});
			slider.data("slide-count", slideCount);

			slider.addClass("ks-slider");
			var sliderGuts = slider.html();
			slider.html($("<div>", {
				class: "ks-slide-track",
				style: "transition:all "+options.speed+" "+options.easing,
				html: sliderGuts
			}));

			slider.find(">.ks-slide-track>div").each(function(){
				var me = $(this);
				var slideGuts = me.html();
				me.addClass("ks-slide").html($("<div>", {
					class: "ks-slide-content",
					html: slideGuts
				}));
			});

			var imageSource, scaleClass;
			slider.find(">.ks-slide-track>img,>.ks-slide-track>.ks-slide>.ks-slide-image").each(function(){
				var me = $(this);
				imageSource = me.attr("src");
				scaleClass = "ks_noScale";
				if (options.imageScaling == "fill") {
					scaleClass = "ks-fill";
				} else if (options.imageScaling == "fit") {
					scaleClass = "ks-fit";
				}

				if (me.parent().hasClass("ks-slide")) {
					var slide = me.parent();
					slide.css("background-image", "url("+imageSource+")").addClass(scaleClass);
				} else if (me.parent().hasClass("ks-slide-content")) {
					var slide = me.parent().parent();
					slide.css("background-image", "url("+imageSource+")").addClass(scaleClass);
				} else {
					var slide = $("<div>", {
						class: "ks-slide "+scaleClass,
						style: "background-image:url("+imageSource+")"
					});
				}
				slide.append("<div class='ks-table ks-slide-loading'><div class='ks-table-row'><div class='ks-table-cell'><div class='ks-loading-spinner'></div></div></div></div>");

				var img = new Image();
				img.onload = function() {
				    slide.addClass("loaded");
				}
				img.src = imageSource;
				if (img.complete) img.onload();

				if (!(me.parent().hasClass("ks-slide") || me.parent().hasClass("ks-slide-content"))) {
					me.replaceWith(slide);
				} else {
					me.remove();
				}
			});

			slider.find(".ks-slide:first").addClass("ks-active");

			function ks_nextSlide() {
				if (currentSlide >= slideCount-1) {
					currentSlide = -1;
				}
				slider.find(">.ks-slide-track").css("transform", "translateX("+(-((currentSlide+1)*100))+"%)");
				currentSlide++;
				if (options.dots) {
					ks_selectDot(currentSlide);
				}
				slider.data("current-slide", currentSlide);
				slider.find(".ks-slide").removeClass("ks-active").eq(currentSlide).addClass("ks-active");
				options.onSlideChange();
			}

			function ks_prevSlide() {
				if (currentSlide == 0) {
					currentSlide = slideCount;
				}
				slider.find(">.ks-slide-track").css("transform", "translateX("+(-((currentSlide-1)*100))+"%)");
				currentSlide--;
				if (options.dots) {
					ks_selectDot(currentSlide);
				}
				slider.data("current-slide", currentSlide);
				slider.find(".ks-slide").removeClass("ks-active").eq(currentSlide).addClass("ks-active");
				options.onSlideChange();
			}

			function ks_gotoSlide(slideIndex) {
				slider.find(">.ks-slide-track").css("transform", "translateX("+(-(slideIndex*100))+"%)");
				currentSlide = slideIndex;
				if (options.dots) {
					ks_selectDot(currentSlide);
				}
				slider.data("current-slide", currentSlide);
				slider.find(".ks-slide").removeClass("ks-active").eq(currentSlide).addClass("ks-active");
				options.onSlideChange();
			}

			sliderPaused = false;
			var autoplayTimeout;
			function ks_autoplay() {
				if (!sliderPaused && options.autoplay) {
					autoplayTimeout = setTimeout(function(){
						ks_nextSlide();
						ks_autoplay();
					}, options.interval);
				}
			}
			if (options.autoplay) {
				ks_autoplay();
			}
			function ks_stopAutoplay() {
				clearTimeout(autoplayTimeout);
			}
			function ks_restartAutoplay() {
				clearTimeout(autoplayTimeout);
				ks_autoplay();
			}

			if (options.dots) {
				var dotsContainer = $("<div>", {class: "ks-dots-container"});
				for (d = 0; d < slideCount; d++) {
					var currentDot = $("<div>", {class: "ks-dot"});
					var currentDotVisual = $("<div>", {class: "ks-dot-visual"});
					currentDot.click(function(){
						ks_gotoSlide(slider.find(".ks-dot").index($(this)));
						if (!sliderPaused === true && options.autoplay) {
							ks_restartAutoplay();
						}
					});
					currentDot.append(currentDotVisual);
					dotsContainer.append(currentDot);
				}
				dotsContainer.find(">.ks-dot").eq(currentSlide).addClass("selected");
				slider.append(dotsContainer);
				function ks_selectDot(dotIndex) {
					dotsContainer.find(">.ks-dot").removeClass("selected").eq(dotIndex).addClass("selected");
				}
			}

			if (options.arrows) {
				var leftArrow = $("<div>", {class: "ks-arrow ks-left-arrow"});
				var rightArrow = $("<div>", {class: "ks-arrow ks-right-arrow"});
				leftArrow.click(function(){
					ks_prevSlide();
					if (!sliderPaused === true && options.autoplay) {
						ks_restartAutoplay();
					}
				})
				rightArrow.click(function(){
					ks_nextSlide();
					if (!sliderPaused === true && options.autoplay) {
						ks_restartAutoplay();
					}
				})
				slider.append(leftArrow).append(rightArrow);
			}

			if (options.draggable) {
				var touchOriginX, touchOriginY, touchFinalX, touchFinalY, xPosition, yPosition, xDistance, yDistance, slideWidth, limitFactor = 5;
				if (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0)) {
					slider.find(">.ks-slide-track").on("touchstart", function(e){
						e.preventDefault();
						var me = $(this);
						var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						var elm = slider.offset();
						var x = touch.pageX - elm.left;
						var y = touch.pageY - elm.top;
						touchOriginX = x;
						me.css("transition","none");
						ks_stopAutoplay();
					});
					slider.find(">.ks-slide-track").on("touchmove", function(e){
						var me = $(this);
						var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						var elm = slider.offset();
						var x = touch.pageX - elm.left;
						var y = touch.pageY - elm.top;
						e.preventDefault();
						me.css("left", (x-touchOriginX)+"px");
					});
					slider.find(">.ks-slide-track").on("touchend", function(e){
						e.preventDefault();
						var me = $(this);
						var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						var elm = slider.offset();
						var x = touch.pageX - elm.left;
						touchFinalX = x;
						xDistance = touchOriginX - touchFinalX;
						slideWidth = slider.width();
						if (xDistance>=slideWidth/limitFactor) {
							ks_nextSlide();
						} else if ((xDistance < 0) && (xDistance <= (slideWidth/limitFactor)*-1)) {
							ks_prevSlide();
						}
						me.css({"transition": "all "+options.speed+" "+options.easing, "left": 0});
						if (!sliderPaused === true && options.autoplay) {
							ks_restartAutoplay();
						}
					});
				} else {
					if ($.fn.draggable) {
						slider.find(">.ks-slide-track").draggable({
							axis: "x",
							scroll: false,
							start: function(event,ui){
								ks_stopAutoplay();
								xPosition = ui.position.left;
								yPosition = ui.position.top;
								slider.find(">.ks-slide-track").css("transition","none");
								},
							stop: function(event,ui){
								slideWidth = slider.width();
								xDistance = (ui.position.left - xPosition)*-1;
								yDistance = (ui.position.top - yPosition)*-1;
								if (xDistance>=slideWidth/limitFactor) {
									ks_nextSlide();
								} else if ((xDistance < 0) && (xDistance <= (slideWidth/limitFactor)*-1)) {
									ks_prevSlide();
								}
								slider.find(">.ks-slide-track").css({"transition": "all "+options.speed+" "+options.easing, "left": 0});
								if (!sliderPaused === true && options.autoplay) {
									ks_restartAutoplay();
								}
							}
						});
					} else {
						console.warn("jQuery UI Draggable is not loaded.  For Kilo to be draggable, please make sure you have jQuery UI installed.");
					}
				}
			}
		});
	}
})(jQuery);

function ks_cssTimingToJavascript(timing) {
	if ($.isNumeric(timing)){
		return timing;
	} else {
		var num = parseFloat(timing, 10),
		unit = timing.match(/m?s/),
		milliseconds;
		if (unit) {
			unit = unit[0];
		}
		switch (unit) {
			case "s":
				milliseconds = num * 1000;
				break;
			case "ms":
				milliseconds = num;
				break;
			default:
				milliseconds = 0;
				break;
		}
		return milliseconds;
	}
}

function ks_javascriptTimingToCSS(timing) {
	if ($.isNumeric(timing)){
		return timing+"ms";
	} else {
		return timing;
	}
}

(function($) {
	$.fn.nextSlide = function () {
		return $(this).each(function(){
			$(this).find(".ks-right-arrow").trigger("click");
		});
	};
})(jQuery);

(function($) {
	$.fn.prevSlide = function () {
		return $(this).each(function(){
			$(this).find(".ks-left-arrow").trigger("click");
		});
	};
})(jQuery);

(function($) {
	$.fn.gotoSlide = function (number) {
		var num = number;
		return $(this).each(function(num){
			$(this).find(".ks-dots .ks-dot").eq(number-1).trigger("click");
		});
	};
})(jQuery);