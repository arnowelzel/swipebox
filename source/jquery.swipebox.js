/*---------------------------------------------------------------------------------------------

@author       Constantin Saguin - @brutaldesign
@author       Arno Welzel
@link         http://csag.co
@github       https://github.com/arnowelzel/swipebox
@version      1.2.4
@license      MIT License

----------------------------------------------------------------------------------------------*/

;(function (window, document, $, undefined) {
	
	$.swipebox = function(elem, options) {

		var defaults = {
			useCSS : true,
			initialIndexOnArray : 0,
			hideBarsDelay : 3000,
			videoMaxWidth : 1140,
			vimeoColor : 'CCCCCC',
			beforeOpen: null,
			afterClose: null
		},
		
		plugin = this,
		elements = [], // slides array [{href:'...', title:'...'}, ...],
		elem = elem,
		selector = elem.selector,
		$selector = $(selector),
		isTouch = document.createTouch !== undefined || ('ontouchstart' in window) || ('onmsgesturechange' in window) || navigator.msMaxTouchPoints,
		supportSVG = !!(window.SVGSVGElement),
		winWidth = window.innerWidth ? window.innerWidth : $(window).width(),
		winHeight = window.innerHeight ? window.innerHeight : $(window).height(),
		html = '<div id="swipebox-overlay">\
				<div id="swipebox-slider"></div>\
				<div id="swipebox-caption"></div>\
				<div id="swipebox-action">\
					<a id="swipebox-close"></a>\
					<a id="swipebox-prev"></a>\
					<a id="swipebox-next"></a>\
				</div>\
		</div>',
		oldOffsetX = 0,
		oldOffsetY = 0;
		
		plugin.settings = {}

		plugin.init = function(){

			plugin.settings = $.extend({}, defaults, options);

			if ($.isArray(elem)) {

				elements = elem;
				ui.target = $(window);
				ui.init(plugin.settings.initialIndexOnArray);

			}else{

				$selector.click(function(e){
					plugin.refresh();
					elements = [];
					var index , relType, relVal;

					if (!relVal) {
						relType = 'rel';
						relVal  = $(this).attr(relType);
					}

					if (relVal && relVal !== '' && relVal !== 'nofollow') {
						$elem = $selector.filter('[' + relType + '="' + relVal + '"]');
					}else{
						$elem = $(selector);
					}

					$elem.each(function(){

						var title = null, href = null;
						
						if( $(this).attr('title') )
							title = $(this).attr('title');
						else if( $(this).children('img').attr('alt') )
							title=$(this).children('img').attr('alt');

						if( $(this).attr('href') )
							href = $(this).attr('href');

						elements.push({
							href: href,
							title: title
						});
					});
					
					index = $elem.index($(this));
					e.preventDefault();
					e.stopPropagation();
					ui.target = $(e.target);
					ui.init(index);
				});
			}
		}

		/**
		 * Refresh method
		 */
		plugin.refresh = function() {
			if (!$.isArray(elem)) {
				ui.destroy();
				$elem = $(selector);
				ui.actions();
			}
		}

		var ui = {

			/**
			 * Initiate Swipebox
			 */
			init : function(index){
				if (plugin.settings.beforeOpen) 
					plugin.settings.beforeOpen();
				this.target.trigger('swipebox-start');
				$.swipebox.isOpen = true;
				this.build();
				this.openSlide(index);
				this.openMedia(index);
				this.preloadMedia(index+1);
				this.preloadMedia(index-1);
			},

			/**
			 * Built HTML containers and fire main functions
			 */
			build : function(){
				var $this = this;

				$('body').append(html);

				if($this.doCssTrans()){
					$('#swipebox-slider').css({
						'-webkit-transition' : 'left 0.4s ease',
						'-moz-transition' : 'left 0.4s ease',
						'-o-transition' : 'left 0.4s ease',
						'-khtml-transition' : 'left 0.4s ease',
						'transition' : 'left 0.4s ease'
					});
					$('#swipebox-overlay').css({
						'-webkit-transition' : 'opacity 1s ease',
						'-moz-transition' : 'opacity 1s ease',
						'-o-transition' : 'opacity 1s ease',
						'-khtml-transition' : 'opacity 1s ease',
						'transition' : 'opacity 1s ease'
					});
					$('#swipebox-action, #swipebox-caption').css({
						'-webkit-transition' : '0.5s',
						'-moz-transition' : '0.5s',
						'-o-transition' : '0.5s',
						'-khtml-transition' : '0.5s',
						'transition' : '0.5s'
					});
				}


				if(supportSVG){
					var bg = $('#swipebox-action #swipebox-close').css('background-image');
					bg = bg.replace('png', 'svg');
					$('#swipebox-action #swipebox-prev,#swipebox-action #swipebox-next,#swipebox-action #swipebox-close').css({
						'background-image' : bg
					});
				}
				
				$.each( elements,  function(){
					$('#swipebox-slider').append('<div class="slide"></div>');
				});

				$this.setDim();
				$this.actions();
				$this.keyboard();
				$this.gesture();
				$this.animBars();
				$this.resize();
				
			},

			/**
			 * Set dimensions depending on windows width and height
			 */
			setDim : function(){

				var width, height, sliderCss = {};
				
				if( "onorientationchange" in window ){

					window.addEventListener("orientationchange", function() {
						if( window.orientation == 0 ){
							width = winWidth;
							height = winHeight;
						}else if( window.orientation == 90 || window.orientation == -90 ){
							width = winHeight;
							height = winWidth;
						}
					}, false);
					
				
				}else{

					width = window.innerWidth ? window.innerWidth : $(window).width();
					height = window.innerHeight ? window.innerHeight : $(window).height();
				}

				sliderCss = {
					width : width,
					height : height
				}


				$('#swipebox-overlay').css(sliderCss);

			},

			resize : function (){
				var $this = this;
				
				$(window).resize(function() {
					$this.setDim();
				}).resize();
			},

			/**
			 * Check if device supports CSS transitions
			 */
			supportTransition : function() {
				var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split(' ');
				for(var i = 0; i < prefixes.length; i++) {
					if(document.createElement('div').style[prefixes[i]] !== undefined) {
						return prefixes[i];
					}
				}
				return false;
			},

			doCssTrans : function(){
				if(plugin.settings.useCSS && this.supportTransition() ){
					return true;
				}
			},

			/**
			 * Touch navigation
			 */
			gesture : function(){
				if ( isTouch ){
					var $this = this,
					distance = null,
					swipMinDistance = 10,
					startCoords = {},
					endCoords = {};
					var bars = $('#swipebox-caption, #swipebox-action');

					bars.addClass('visible-bars');
					$this.setTimeout();

					$('#swipebox-slider').bind('touchstart', function(e){

						$(this).addClass('touching');

						endCoords = e.originalEvent.targetTouches[0];
							startCoords.pageX = e.originalEvent.targetTouches[0].pageX;

						$('.touching').bind('touchmove',function(e){
							e.preventDefault();
							e.stopPropagation();
								endCoords = e.originalEvent.targetTouches[0];

						});
						
								return false;

						}).bind('touchend',function(e){
							e.preventDefault();
					e.stopPropagation();
				
					distance = endCoords.pageX - startCoords.pageX;
						
						if( distance >= swipMinDistance ){
							
							// swipeLeft
							$this.getPrev();
						
						}else if( distance <= - swipMinDistance ){
							
							// swipeRight
							$this.getNext();
						
						}else{
							// tap
							if(!bars.hasClass('visible-bars')){
								$this.showBars();
								$this.setTimeout();
							}else{
								$this.clearTimeout();
								$this.hideBars();
							}
						}

						$('.touching').off('touchmove').removeClass('touching');
						
					});
				}
			},

			setTimeout: function(){
				if(plugin.settings.hideBarsDelay > 0){
					var $this = this;
					$this.clearTimeout();
					$this.timeout = window.setTimeout( function(){
						$this.hideBars() },
						plugin.settings.hideBarsDelay
					);
				}
			},
			
			/**
			 * Clear timer
			 */
			clearTimeout: function(){	
				window.clearTimeout(this.timeout);
				this.timeout = null;
			},

			/**
			 * Show navigation and title bars
			 */
			showBars : function(){
				var bars = $('#swipebox-caption, #swipebox-action');
				if(this.doCssTrans()){
					bars.addClass('visible-bars');
				}else{
					$('#swipebox-caption').animate({ top : 0 }, 500);
					$('#swipebox-action').animate({ bottom : 0 }, 500);
					setTimeout(function(){
						bars.addClass('visible-bars');
					}, 1000);
				}
			},

			/**
			 * Hide navigation and title bars
			 */
			hideBars : function(){
				var bars = $('#swipebox-caption, #swipebox-action');
				if(this.doCssTrans()){
					bars.removeClass('visible-bars');
				}else{
					$('#swipebox-caption').animate({ top : '-50px' }, 500);
					$('#swipebox-action').animate({ bottom : '-50px' }, 500);
					setTimeout(function(){
						bars.removeClass('visible-bars');
					}, 1000);
				}
			},

			/**
			 * Animate navigation and top bars
			 */
			animBars : function(){
				var $this = this;
				var bars = $('#swipebox-caption, #swipebox-action');
					
				bars.addClass('visible-bars');
				$this.setTimeout();
				
				// Some browsers fire click events, even if touch
				// was already handled - so add click handler in the
				// slider only for non-touch devices
				if(!isTouch) {
					$('#swipebox-slider').click(function(e){
						if(!bars.hasClass('visible-bars')){
							$this.showBars();
							$this.setTimeout();
						} else {
							$this.clearTimeout();
							$this.hideBars();
						}
					});
				}

				$('#swipebox-action').hover(function() {
				  		$this.showBars();
						bars.addClass('force-visible-bars');
						$this.clearTimeout();
					
					},function() { 
						bars.removeClass('force-visible-bars');
						$this.setTimeout();

				});
			},

			/**
			 * Keyboard navigation
			 */
			keyboard : function(){
				var $this = this;
				$(window).bind('keyup', function(e){
					e.preventDefault();
					e.stopPropagation();
					if (e.keyCode == 37){
						$this.getPrev();
					}
					else if (e.keyCode==39){
						$this.getNext();
					}
					else if (e.keyCode == 27) {
						$this.closeSlide();
					}
				});
			},

			/**
			 * Navigation events : go to next slide, go to prevous slide and close
			 */
			actions : function(){
				var $this = this;
				
				if( elements.length < 2 ){
					$('#swipebox-prev, #swipebox-next').hide();
				}else{
					$('#swipebox-prev').bind('click', function(e){
						e.preventDefault();
						e.stopPropagation();
						$this.getPrev();
						$this.setTimeout();
					});
					
					$('#swipebox-next').bind('click', function(e){
						e.preventDefault();
						e.stopPropagation();
						$this.getNext();
						$this.setTimeout();
					});
				}

				$('#swipebox-close').bind('click', function(e){
					$this.closeSlide();
				});
			},
			
			/**
			 * Set current slide
			 */
			setSlide : function (index, isFirst){
				isFirst = isFirst || false;
				
				var slider = $('#swipebox-slider');
				
				if(this.doCssTrans()){
					slider.css({ left : (-index*100)+'%' });
				}else{
					slider.animate({ left : (-index*100)+'%' });
				}
				
				$('#swipebox-slider .slide').removeClass('current');
				$('#swipebox-slider .slide').eq(index).addClass('current');
				this.setTitle(index);

				if( isFirst ){
					slider.fadeIn();
				}

				$('#swipebox-prev, #swipebox-next').removeClass('disabled');
				if(index == 0){
					$('#swipebox-prev').addClass('disabled');
				}else if( index == elements.length - 1 ){
					$('#swipebox-next').addClass('disabled');
				}
			},
		
			/**
			 * Open slide
			 */
			openSlide : function (index){
				// Workaround for browsers which  don't position the overlay properly:
				// Remember current scroll position and then scroll to the top to
				// make sure, the slider (which is on top) is visible
				if(oldOffsetX == 0 && oldOffsetY == 0)
				{
					oldOffsetX = $(window).scrollLeft();
					oldOffsetY = $(window).scrollTop();
				}
				$(window).scrollLeft(0);
				$(window).scrollTop(0);
				
				$('html').addClass('swipebox');
				$(window).trigger('resize'); // fix scroll bar visibility on desktop
				this.setSlide(index, true);
			},
		
			/**
			 * Set a time out if the media is a video
			 */
			preloadMedia : function (index){
				var $this = this, src = null;

				if( elements[index] !== undefined )
					src = elements[index].href;

				if( !$this.isVideo(src) ){
					setTimeout(function(){
						$this.openMedia(index);
					}, 1000);
				}else{
					$this.openMedia(index);
				}
			},
			
			/**
			 * Open
			 */
			openMedia : function (index){
				var $this = this, src = null;

				if( elements[index] !== undefined )
					src = elements[index].href;

				if(index < 0 || index >= elements.length){
					return false;
				}

				if( !$this.isVideo(src) ){
					$this.loadMedia(src, function(){
						$('#swipebox-slider .slide').eq(index).html(this);
					});
				}else{
					$('#swipebox-slider .slide').eq(index).html($this.getVideo(src));
				}
				
			},

			/**
			 * Set link title attribute as caption
			 */
			setTitle : function (index, isFirst){
				var title = null;

				$('#swipebox-caption').empty();

				if( elements[index] !== undefined )
					title = elements[index].title;
				
				if(title){
					$('#swipebox-caption').append(title);
				}
			},

			/**
			 * Check if the URL is a video
			 */
			isVideo : function (src){

				if( src ){
					if( 
						src.match(/youtube\.com\/watch\?v=([a-zA-Z0-9\-_]+)/) 
						|| src.match(/vimeo\.com\/([0-9]*)/) 
					){
						return true;
					}
				}
					
			},

			/**
			 * Get video iframe code from URL
			 */
			getVideo : function(url){
				var iframe = '';
				var output = '';
				var youtubeUrl = url.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
				var vimeoUrl = url.match(/vimeo\.com\/([0-9]*)/);
				if( youtubeUrl ){

					iframe = '<iframe width="560" height="315" src="//www.youtube.com/embed/'+youtubeUrl[1]+'" frameborder="0" allowfullscreen></iframe>';
				
				}else if(vimeoUrl){

					iframe = '<iframe width="560" height="315"  src="http://player.vimeo.com/video/'+vimeoUrl[1]+'?byline=0&amp;portrait=0&amp;color='+plugin.settings.vimeoColor+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
				
				}

				return '<div class="swipebox-video-container" style="max-width:'+plugin.settings.videoMaxWidth+'px"><div class="swipebox-video">'+iframe+'</div></div>';
			},
			
			/**
			 * Load image
			 */
			loadMedia : function (src, callback){
				if( !this.isVideo(src) ){
					var img = $('<img>').on('load', function(){
						callback.call(img);
					});
					
					img.attr('src',src);
				}	
			},
			
			/**
			 * Get next slide
			 */
			getNext : function (){
				var $this = this;
				index = $('#swipebox-slider .slide').index($('#swipebox-slider .slide.current'));
				if(index+1 < elements.length){
					index++;
					$this.setSlide(index);
					$this.preloadMedia(index+1);
				}
				else{
					
					$('#swipebox-slider').addClass('rightSpring');
					setTimeout(function(){
						$('#swipebox-slider').removeClass('rightSpring');
					},500);
				}
			},
			
			/**
			 * Get previous slide
			 */
			getPrev : function (){
				index = $('#swipebox-slider .slide').index($('#swipebox-slider .slide.current'));
				if(index > 0){
					index--;
					this.setSlide(index);
					this.preloadMedia(index-1);
				}
				else{
					
					$('#swipebox-slider').addClass('leftSpring');
					setTimeout(function(){
						$('#swipebox-slider').removeClass('leftSpring');
					},500);
				}
			},


			/**
			 * Close
			 */
			closeSlide : function (){
				$('html').removeClass('swipebox');
				$(window).trigger('resize');
				this.destroy();
				
				// Restore old scroll position
				if(oldOffsetX != 0 || oldOffsetY != 0)
				{
					$(window).scrollLeft(oldOffsetX);
					$(window).scrollTop(oldOffsetY);
					oldOffsetX = 0;
					oldOffsetY = 0;
				}
			},

			/**
			 * Destroy the whole thing
			 */
			destroy : function(){
				$(window).unbind('keyup');
				$('#swipebox-slider').unbind('touchstart');
				$('#swipebox-slider').unbind('touchmove');
				$('#swipebox-slider').unbind('touchend');
				$('#swipebox-slider').unbind();
				$('#swipebox-overlay').remove();
				if (!$.isArray(elem))
					elem.removeData('_swipebox');
				if ( this.target )
					this.target.trigger('swipebox-destroy');
				$.swipebox.isOpen = false;
				if (plugin.settings.afterClose) 
					plugin.settings.afterClose();
 			}

		};

		plugin.init();
		
	};

	$.fn.swipebox = function(options){
		if (!$.data(this, "_swipebox")) {
			var swipebox = new $.swipebox(this, options);
			this.data('_swipebox', swipebox);
		}
		return this.data('_swipebox');
	}

}(window, document, jQuery));