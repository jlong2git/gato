// determine what event we should look for to detect orientation changes
orientationChangeEventName = ( "onorientationchange" in window ) ? "orientationchange" : "resize";

// add css class to html element for touch screen devices
// NB: This is not 100% reliable, so don't use it on mission critical stuff
// http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
isTouchScreen = "ontouchstart" in window;
document.documentElement.className += isTouchScreen ? " touch" : " no-touch";

// google analytics stuff for videos
var ga; // google analytics object
var destroyerGlobalPageTracker;
var destroyerSitePageTracker;
function record_video_analytics (videourl) {

	if (destroyerGlobalPageTracker) {
		ga(destroyerGlobalPageTracker.name + '.send', {
			'hitType': 'event',
			'eventCategory': 'Videos',
			'eventAction': document.title+' <'+window.location+'>',
			'transport': 'beacon'
		});
	}

	if (destroyerSitePageTracker) {
		ga(destroyerSitePageTracker.name + '.send', {
			'hitType': 'event',
			'eventCategory': 'Videos',
			'eventAction': document.title+' <'+window.location+'>',
			'transport': 'beacon'
		});
	}
}

// provide a function to detect IE6
function detect_ie6() {
	var version = parseFloat(navigator.appVersion.split('MSIE')[1]);
	if ((version >= 5.5) && (version < 7) && (document.body.filters)) return true;
}

// detect iphone or ipod touch
function detect_iphone() {
	return navigator.userAgent.match(/(iPhone|iPod)/i);
}

// detect Apple mobile devices with touch screen interfaces
function detect_apple() {
	return navigator.userAgent.match(/(iPhone|iPod|iPad)/i);
}

// detect devices with touch screen interfaces
// see caveat above
function detect_touch() {
	return isTouchScreen;
}

// detect android
function detect_android() {
	return navigator.userAgent.match(/android/i);
}

// detect mobile
function detect_mobile() {
	return screen && screen.width <= 500;
}

// function to load a PNG in IE6 after the initial load
function load_alpha(item) {
	if (typeof(supersleight) != 'undefined') return supersleight.load_alpha(item);
}
// function to unload the alpha channel of a PNG in IE6
function unload_alpha(item) {
	if (typeof(supersleight) != 'undefined') return supersleight.unload_alpha(item);
}

function fireEvent(obj,evt){
	if( document.createEvent ) {
		if (evt == 'click' || evt == 'mouseup' || evt == 'mousedown')
			var evObj = document.createEvent('MouseEvents');
		else
			var evObj = document.createEvent('HTMLEvents');
		evObj.initEvent( evt, false, true );
		obj.dispatchEvent(evObj);
	} else if( document.createEventObject ) {
		obj.fireEvent('on'+evt);
	}
}

// add trim function to the String object
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
};

Array.prototype.binarySearch = function(v, i){
	var o = this;
	var h = o.length, l = -1, m;
	while(h - l > 1)
			if(o[m = h + l >> 1] < v) l = m;
			else h = m;
	return o[h] != v ? i ? h : -1 : h;
};

var hostElements = window.location.hostname.split(".");

function createCookie(name,value,domain,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	if (!domain) domain = "." + hostElements[ hostElements.length - 2 ] + "." + hostElements[ hostElements.length - 1 ];
	document.cookie = name+"="+escape(value)+expires+"; path=/;domain=" + domain;
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length,c.length));
	}
	return null;
}

function deleteCookie(name) {
	domain = "." + hostElements[ hostElements.length - 1 ];
	for (var i = 2; i <= hostElements.length; i++) {
		domain = "." + hostElements[ hostElements.length - i ] + domain;
		createCookie(name, '', domain, -1);
	}
}

function process_caption_url(captUrl) {
	if (magnolia_assets_url.substr(0,4) != 'http') { magnolia_assets_url = window.location.protocol+'//'+window.location.host+magnolia_assets_url; }
	return magnolia_assets_url+'/common/js/flowplayer/caption_fetch.jsp?path='+escape(captUrl);
}

function toggle_captions(lnk) {
	var p = $f(lnk);
	if (!p) return;
	if (!p.isLoaded()) return;
	var c = p.getPlugin('captionContent');
	c.toggle();
	if (c.display) { // captions were shown
		createCookie('txst_caption_persist', '1', '', 365);
		if (showcontrols.controlsAreUp) showcontrols(lnk, 1);
		else hidecontrols(lnk, 1);
	} else { // captions were hidden
		createCookie('txst_caption_persist', '0', '', 365);
	}
}

function showcontrols(lnk, speed) {
	if (!lnk.autoHideMode) { return; }
	var p = $f(lnk);
	var c = p.getPlugin('captionContent');
	var t = p.getPlugin('controls');
	if (!speed) speed = 400;
	if (c.display) { c.animate({bottom: t.height}, speed); }
	showcontrols.controlsAreUp = true;
}

function hidecontrols(lnk, speed) {
	if (!lnk.autoHideMode) { return; }
	var c = $f(lnk).getPlugin('captionContent');
	if (!speed) speed = 1000;
	if (c.display) c.animate({bottom: 0}, speed);
	showcontrols.controlsAreUp = false;
}

function finish_video_load(lnk, options, captUrl, showcaptions) {
	if (lnk.loadFinished) { return; }
	lnk.loadFinished = true;
	if (captUrl) {
		var capt = lnk.next('a.videoframe-caption-link');
		if (!capt) {
			capt = $(document.createElement('a'));
			capt.className = 'videoframe-caption-link';
			lnk.up().appendChild(capt);
		}
		capt.href = captUrl;

		var timer;
		capt.innerHTML = 'CC';
		capt.setStyle({
			position: 'absolute',
			display: 'block',
			zIndex: 100,
			color: '#FF0000',
			border: '2px solid #777777',
			textDecoration: 'none',
			padding: '0px 2px',
			fontWeight: 'bold',
			fontSize: '12px',
			backgroundColor: '#444444',
			opacity: 0
		});
		if (lnk.positionedOffset()[0] > 0) {
			var lwidth = lnk.offsetWidth ? lnk.offsetWidth : link.getStyle('width');
			capt.setStyle({left: (lnk.positionedOffset()[0] + lwidth - capt.offsetWidth - 5)+'px'});
		} else {
			capt.setStyle({right: '5px'});
		}
		if (lnk.positionedOffset()[1] > 0) {
			capt.setStyle({top: (lnk.positionedOffset()[1] + 5)+'px'});
		} else {
			capt.setStyle({top: '5px'});
		}
		capt.observe('click', function (e) {
			this.blur();
			toggle_captions(lnk);
			e.stop();
		});
		capt.observe('mouseover', function (e) {
			this.mouseisoverme = true;
			if ($f(lnk).isLoaded()) {
				this.setStyle({opacity: 0.6});
			} else {
				this.setStyle({opacity: 0});
			}
			clearTimeout(timer);
		});
		capt.observe('mouseout', function (e) {
			this.mouseisoverme = false;
		});
		options.clip.captionUrl = process_caption_url(captUrl);
		options.plugins.captions = {
			url: flowplayer_caption_path,
			captionTarget: "captionContent",
			button: null
		};
		var captbottom = 0;
		if (options.plugins.controls && (!options.plugins.controls.autoHide || options.plugins.controls.autoHide == 'never')) {
			captbottom = 24;
			if (options.plugins.controls.height) captbottom = options.plugins.controls.height;
			else options.plugins.controls.height = 24;
		}
		options.plugins.captionContent = {
			url: flowplayer_content_path,
			bottom: captbottom,
			display: 'none',
			height: 19,
			width: '100%',
			backgroundColor: '#000000',
			borderRadius: 0,
			padding: '0px',
			opacity: .9,
			border: 0,
			style: {
				body: {
					fontWeight: 'bold',
					fontSize: '12px',
					fontFamily: 'Arial',
					textAlign: 'center',
					color: '#ffffff'
				}
			}
		};
		options.onLoad = function () {
			showcontrols.controlsAreUp = true;
		}
		options.clip.onStart = function () {
			capt.setStyle({opacity: 0.6});
			timer = setTimeout( function () { capt.setStyle({opacity: 0}); }, 2500 );
			if (showcaptions || (readCookie('txst_caption_persist') > 0 && showcaptions !== false)) toggle_captions(lnk);
			record_video_analytics(lnk.href);
		};
		options.onUnload = function () {
			lnk.txst_isLoaded = false;
			lnk.loadFinished = false;
			capt.setStyle({opacity: 0});
			clearTimeout(timer);
		}
		options.onMouseOver = function () {
			capt.setStyle({opacity: 0.6});
			clearTimeout(timer);
		};
		options.onMouseOut = function () {
			if (!capt.mouseisoverme) { capt.setStyle({opacity: 0}); }
			clearTimeout(timer);
		};
		options.onFullscreen = function() { this.getPlugin('captionContent').css({body: {fontSize: '40px'}, height: 54}); };
		options.onFullscreenExit = function() { this.getPlugin('captionContent').css({body: {fontSize: '12px'}, height: 19}); };

		if (options.plugins.controls && options.plugins.controls.autoHide && options.plugins.controls.autoHide != 'never') {
			options.plugins.controls.onAnimStartShow = function() { showcontrols(lnk); };
			options.plugins.controls.onAnimStartHide = function() { hidecontrols(lnk); };
			lnk.autoHideMode = true;
		}
	} else {
		options.clip.onStart = function () {
			record_video_analytics(lnk.href);
		};
	}
	lnk.observe('click', function() { lnk.blur(); });
	flowplayer(lnk, { src: flowplayer_main_path, wmode: 'opaque'}, options);
	if (options.autoPlayMe) $f(lnk).play();
}

var halt_video_load = false;
function video_load(lnk, opts) {
	if (halt_video_load) { return; }
	lnk = $(lnk);
	if (!opts) opts = {};
	if (flashembed && flashembed.isSupported([9, 115]) && !lnk.txst_isLoaded && flowplayer) {
		if (opts.controls && typeof opts.controls != 'object') {
			opts.controls = { autoHide: 'always', hideDelay: 2000 };
		}
		var options = {
			key: '#$4301ae9f3200c1a71cf',
			plugins: {
				controls: (opts.controls ? opts.controls : null)
			},
			clip: {
				autoPlay: true,
				autoBuffering: true,
				scaling: 'fit',
				bufferLength: 1,
				onFinish: function () {
				  var p = this;
				  // there's an issue with Safari 4 for Windows if you
				  // try to unload immediately, so we set a timeout instead
				  setTimeout(function () { p.unload(); }, 50);
				}
			},
			// This line is extremely important - without it you CANNOT dynamically
			// update a video's splash screen.
			//
			// Flowplayer loads the splash content when we first call flowplayer() on it,
			// and then every time unload() is called on the player, it resets the splash
			// screen to what it was originally.
			//
			// Since it calls unload on ALL players just before playing any video (including
			// the one in question), you can never get new content into the splash cache.
			// However, if you tell it to never unload an already-unloaded player (what we're
			// doing here), then it's able to get the new splash content saved before playing
			// the video.
			onBeforeUnload: function () { return this.isLoaded(); },
			autoPlayMe: (opts.autoplay ? true : false)
		};

		if (opts.captUrl) {
			finish_video_load(lnk, options, opts.captUrl, opts.captions);
		} else {
			var capt = lnk.next('a.videoframe-caption-link');
			if (capt && capt.readAttribute('href')) {
				finish_video_load(lnk, options, capt.readAttribute('href'), opts.captions);
			} else {
				var tryurl = lnk.href.replace(/\.\w*$/,'.srt');
				var abortTimer;
				var areq = new Ajax.Request(process_caption_url(tryurl), {
					method: 'get',
					onCreate: function (t) {
						abortTimer = setTimeout(function () {
							areq.abort();
							finish_video_load(lnk, options, '', opts.captions);
						}, 600);
					},
					onSuccess: function (t) {
						clearTimeout(abortTimer);
						if (t.responseText.length > 5) {
							finish_video_load(lnk, options, tryurl, opts.captions);
						} else {
							finish_video_load(lnk, options, '', opts.captions);
						}
					}
				});
			}
		}
	}
	lnk.txst_isLoaded = true;
}

// This is a fix for Prototype under IE7 and IE8
// Refer to our case #3027 and Prototype's ticket #737
if (Prototype.Browser.IE) {
	Element.addMethods({getStyle: function(element, style) {
		element = $(element);
		style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
		var value = element.style[style];

		if (style == 'opacity') {
			if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
				if (value[1]) return parseFloat(value[1]) / 100;
			return 1.0;
		} else if (!value && element.currentStyle) value = element.currentStyle[style];

		if (value == 'auto') {
			if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
				return element['offset' + style.capitalize()] + 'px';
			return null;
		}
		return value;
	}});
}

// Add an abort method to Prototype's Ajax implementation
Ajax.Request.prototype.abort = function() {
	this.transport.onreadystatechange = Prototype.emptyFunction;
	this.transport.abort();
	if (Ajax.activeRequestCount > 0) Ajax.activeRequestCount--;
}

function cssDim(dim) {
	if (dim == "thin") return 1;
	if (dim == "medium") return 3;
	if (dim == "thick") return 5;
	var fl = parseFloat(dim);
	if (isNaN(fl)) fl = 0;
	return Math.round(fl);
}

// getHeight() and getWidth() are provided by prototype but sometimes are too limited
// let's add some methods that automatically subtract the width of the borders and padding
// getInnerXXXX functions will subtract border width,
// getContentXXXX functions will subtract border width AND padding
// redraw function forces an element to be redrawn, useful for IE when it's being stubborn
Element.addMethods({ getInnerDimensions: function(element) {
	return {
		width: element.getWidth()-cssDim(element.getStyle('border-left-width'))-cssDim(element.getStyle('border-right-width')),
		height: element.getHeight()-cssDim(element.getStyle('border-top-width'))-cssDim(element.getStyle('border-bottom-width'))
	};
}, getInnerHeight: function(element) {
	return element.getInnerDimensions().height;
}, getInnerWidth: function (element) {
	return element.getInnerDimensions().width;
}, getContentDimensions: function(element) {
	var inner = element.getInnerDimensions();
	return {
		width: inner.width-cssDim(element.getStyle('padding-left'))-cssDim(element.getStyle('padding-right')),
		height: inner.height-cssDim(element.getStyle('padding-top'))-cssDim(element.getStyle('padding-bottom'))
	};
}, getContentHeight: function (element) {
	return element.getContentDimensions().height;
}, getContentWidth: function (element) {
	return element.getContentDimensions().width;
}});
function getDocHeight() {
	var ch = oh = ih = sh = 0;
	if (document.body.clientHeight) ch = document.body.clientHeight;
	if (document.documentElement.offsetHeight) oh = document.documentElement.offsetHeight;
	if (window.innerHeight) ih = window.innerHeight;
	if (document.body.parentNode.scrollHeight) sh = document.body.parentNode.scrollHeight;
    return Math.max(ch, oh, ih, sh);
}
function getDocWidth() {
	var cw = ow = iw = sw = 0;
	if (document.body.clientWidth) cw = document.body.clientWidth;
	if (document.documentElement.offsetWidth) ow = document.documentElement.offsetWidth;
	if (window.innerWidth) iw = window.innerWidth;
	if (document.body.parentNode.scrollWidth) sw = document.body.parentNode.scrollWidth;
    return Math.max(cw, ow, iw, sw);
}
function getViewportHeight() {
	var vh = document.viewport.getHeight();
	if (window.innerHeight - vh > 30 || !vh) return window.innerHeight;
	return vh;
}
function getViewportWidth() {
	var vw = document.viewport.getWidth();
	return vw || window.innerWidth;
}
function ie_redraw() {
	var version = parseFloat(navigator.appVersion.split('MSIE')[1]);
	if (version >= 5.5 && version < 9) {
		document.body.style.display = 'none';
		document.body.style.display = 'block';
	}
}

Array.prototype.shuffle = function(){ //v1.0
	for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
};

// clear search fields of their default when clicked
document.observe('dom:loaded', function () {
	$$('.txst-banner-search input, input.search-default, .search-box-content input.query').each(function(fld) {
		fld.observe('focus', function (event) {
			if (this.value == this.defaultValue) this.value = '';
			this.addClassName('focused');
		});
		fld.observe('blur', function (event) {
			if (this.value == '') {
				this.value = this.defaultValue;
				this.removeClassName('focused');
			}
		});
	});
});

// let's set a variable on dom:loaded so we know that setting a dom:loaded observer will
// no longer work
var gato_dom_loaded = false;
document.observe('dom:loaded', function() {
	gato_dom_loaded = true;
});

function ensureReady(closure) {
	if (gato_dom_loaded) closure();
	else document.observe('dom:loaded', closure);
}

// Shrinks the font-size of the given element until
// it fits inside its parent.
var fitText = function(item) {
	item = $(item);
	item.origFontSize = parseFloat(item.getStyle('fontSize'));

	var doFit = function() {
		var boxLayout = new Element.Layout(item.up(), true);
		var boxHeight = boxLayout.get('height');
		var boxWidth = boxLayout.get('width');

		while (true) {
			var layout = new Element.Layout(item);
			var height = layout.get('margin-box-height');
			var width = layout.get('margin-box-width');
			if (height >= boxHeight || width >= boxWidth) {
				var fontSize = parseFloat(item.getStyle('fontSize')) - 1;
				if (fontSize >= 8) {
					item.setStyle({ fontSize: fontSize + 'px' });
					continue;
				}
			}
			break;
		}
	};

	doFit();
	Event.observe(window, 'resize', function (e) {
		item.setStyle({ fontSize: item.origFontSize + 'px' });
		doFit();
	});
};

// hooking an observer to window.resize can be dangerous for performance
// depending on browser your function could be called for every pixel between
// the old and new sizes
// this adds a small setTimeout so that your function runs when the resize
// event has settled down
// it also calls your function immediately, because isn't page load really the
// first resize event?
function resizeTimeout(callback) {
	var to;
	var savedWidth = 0;
	var savedHeight = 0;
	var myfunc = function () {
    var vpw = window.innerWidth;
    var vph = window.innerHeight;
    if (vph != savedHeight || vpw != savedWidth) {
      clearTimeout(to);
		  to = setTimeout(callback, 100);
		  savedWidth = vpw;
		  savedHeight = vph;
		}
	};
	jQuery(document).ready(myfunc);
	jQuery(window).resize(myfunc);
}

// jQuery already has an 'fx' queue for each jquery object, but it permits
// a lot of bad situations, like event-based animations writing over one another.
//
// This function should make it a bit easier to keep things in order and to queue up
// complex animations involving multiple DOM elements.
//
// qname: a unique string, probably a module name so your widget gets a private queue
// callback: the function that initiates your animation, including any setup
//   must return a promise, probably a jQuery.Deferred object obtained from jQuery.when()
// successcb: optional function to be called on successful addition to the queue
//   queue is limited to 3 so that the user won't be left waiting
//   use this function to update your widget's internal state, this way it remains unchanged
//   when your queue is full and the animation is not actually going to happen
//
// returns a jQuery.Deferred() object so that you can chain commands
// like .done(), .always(), and .fail(), as is typical in jQuery
//
// see gato-component-feature/js/feature.js for example usage
function animQueue(qname, callback, successcb) {
	if (typeof(animQueue.q) == 'undefined') animQueue.q = {};
	if (typeof(animQueue.q[qname]) == 'undefined') animQueue.q[qname] = [];
	var q = animQueue.q[qname];
	var deferred = new jQuery.Deferred();
	deferred.queuecb = callback;
	if (q.length > 2) {
		setTimeout(function () { deferred.reject(); }, 0);
	} else {
		q.push(deferred);
		if (typeof(successcb)=='function') successcb();
		var finish = function() {
			var qdefer = q.shift();
			qdefer.resolve();
			if (q.length > 0) q[0].queuecb().done(finish);
		};
		if (q.length == 1) q[0].queuecb().done(finish);
	}
	return deferred;
}

// provide an accessible jQuery event for clicking a link and then
// calling blur(), we do this a lot to avoid ugly CSS :focus issues,
// but if someone is keyboard navigating we should not blur() as they
// will lose their place in the document
jQuery.fn.blurclick = function (callback) {
  this.on('keydown click', function (e) {
    if (e.type=='click') this.blur();
    if (e.keyCode == 13 || e.type=='click') {
      e.preventDefault();
      return callback.call(this,e);
    }
  });
}

// requires jquery
//
// provide a function that can wait for an element to appear on the
// page so that it can be modified
//
// parentselector should be something that appears in the raw HTML so
// that we can watch a smaller area for changes.  Just use the smallest
// DOM element possible, or all the way up to 'body' if the target element
// can truly appear anywhere
//
// callback will receive a jQuery object containing the target element
// as a parameter
function waitforselector(parentselector, selector, callback) {
  var sanitycount = 0;
  var parent = jQuery(parentselector);

  // parent must exist at the time of the call so that we can
  // use waitforselector on all pages without fear of creating a javascript error
  if (parent.size() == 0) return;

  if (parent.find(selector).size() > 0) return callback(parent.find(selector));
  if (MutationObserver) {
    var observer = new MutationObserver(function(mutations, observer) {
      sanitycount++;
      if (parent.find(selector).size() > 0) {
        observer.disconnect();
        return callback(parent.find(selector));
      } else if (sanitycount > 200) {
        observer.disconnect();
      }
    });
    observer.observe(parent.get(0), {childList: true, subtree: true});
  } else {
    var observer = function() {
      sanitycount++;
      if (parent.find(selector).size() > 0) return callback(parent.find(selector));
      else if (sanitycount < 200) setTimeout(observer, 100);
    }
    setTimeout(observer, 100);
  }
}

// specialized version of waitforselector especially for changing labels
// on magnolia edit bars
function magnolialabelchange(parentselector, selector, newlabel) {
  waitforselector(parentselector, selector, function (ele) {
    ele.find('.mgnlEditorBarLabel').html(newlabel).attr('title',newlabel);
  });
}
function titledlabelchange(parentselector, prefix) {
  prefix = prefix || '';
  waitforselector(parentselector, '.mgnlEditor.component', function (jqobj) {
    jqobj.each(function (index, ele) {
      ele = jQuery(ele);
      ele.find('.mgnlEditorBarLabel').html(prefix+ele.parents(parentselector).attr('data-title'));
    });
  });
}
// jQuery plugin method for creating an accessible
// hover menu
// usage: $('a.linktohoverover').hovermenu('.thingtohideandshow');
// first element MUST be a link so that it is eligible for tabs
// during keyboard control
jQuery.fn.hovermenu = function (submenu) {
  var parent = this;
  var items = jQuery(submenu);
  var timeout;
  var show = function () {
    clearTimeout(timeout);
    items.show();
  };
  var hide = function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () { items.hide(); }, 200);
  };
  parent.mouseover(function (e) {
    show();
  }).mouseout(function (e) {
    hide();
  }).focus(function (e) {
    show();
  }).blur(function (e) {
    hide();
  });
  items.find('a').mouseover(function (e) {
    show();
  }).mouseout(function (e) {
    hide();
  }).focus(function (e) {
    show();
  }).blur(function (e) {
    hide();
  });
}

// to be used on a jQuery object containing a single image
// if image is already loaded (cached, usually), then callback executed immediately
// otherwise executed on jquery load event
// if you just use the load event cached images will never trigger your code
jQuery.fn.afterload = function (callback) {
  if (this.prop('complete')) callback();
  else this.load(callback);
}

// these are cross-browser resolving variables that can be used for
// high performing animations
var animationframe = window.requestAnimationFrame ||
                     window.webkitRequestAnimationFrame ||
                     window.mozRequestAnimationFrame ||
                     window.msRequestAnimationFrame ||
                     window.oRequestAnimationFrame ||
                     function(callback){ window.setTimeout(callback, 1000/20) };
var cssTransform = (function(){
    var prefixes = 'transform webkitTransform mozTransform oTransform msTransform'.split(' ')
      , el = document.createElement('div')
      , cssTransform
      , i = 0
    while( cssTransform === undefined ){
        cssTransform = el.style[prefixes[i]] != undefined ? prefixes[i] : undefined
        i++
     }
     return cssTransform
 })();

/*
	cutoffs:
	a few seconds ago
	1 - 59 Minutes Ago
	1 - 6 Hours Ago
	Today at 9:37 A.M.
	Yesterday at 11:23 P.M.
	October 31 
 */
function relativeTime(time) {
	t = moment(time);
  if (t.isAfter(moment().subtract(360, 'minutes'))) { // < 6h ago
    return t.fromNow();
  } else {
    return t.calendar(null, {
      sameDay : '[Today at] LT',
      lastDay : '[Yesterday at] LT',
      sameElse : 'MMMM D'
    });
  }
}

jQuery(function($) { 
  $('.timestamp.relative').each(function() {
    // replace timestamps with relative time 
    $(this).text(relativeTime($(this).data("timestamp")));
  });
});
