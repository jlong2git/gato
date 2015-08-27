function modal(content) {
	this.opacity = 0.85;
	this.content = content;
	this.contentparent = content.parentNode;
	
	// let's make sure the modal content isn't shown when we're not modal
	this.content.setStyle({display: 'none'});
	
	if (gato_dom_loaded) this.init();
	else document.observe('dom:loaded', this.init.bind(this));
	
}

modal.prototype.init = function() {
	if (!$('modal_outer')) {
		// OUTER DIV
		modal.outerdiv = $(document.createElement('div'));
		modal.outerdiv.id = 'modal_outer';
		modal.outerdiv.setStyle({ 
			display: 'none', 
			position: 'absolute',
			width: '100%',
			height: '100%',
			margin: 0,
			padding: 0,
			top: 0,
			left: 0,
			zIndex: 899 
		});
		document.body.appendChild(modal.outerdiv);

		// BACKGROUND DIV
		modal.bgdiv = $(document.createElement('div'));
		modal.bgdiv.setStyle({
			opacity: this.opacity, 
			backgroundColor: '#000000',
			position: 'absolute',
			zIndex: -1,
			width: '100%',
			height: '100%',
			margin: 0,
			padding: 0,
			top: 0,
			left: 0
		});
		modal.bgdiv.observe('click', function(e) {
			modal.currentmodal.hide();
			e.stop();
		});
		modal.outerdiv.appendChild(modal.bgdiv);

		// CONTENT DIV
		modal.innerdiv = $(document.createElement('div'));
		modal.innerdiv.setStyle({
			position: 'relative',
			top: 30,
			margin: '30px auto',
			backgroundColor: 'white',
			filter: 'progid:DXImageTransform.Microsoft.Shadow(color="#000000", Direction=180, Strength=50);'
		});
		modal.innerdiv.style['webkitBoxShadow'] = '0px 0px 50px black';
		modal.innerdiv.style['MozBoxShadow'] = '0px 0px 50px black';
		modal.innerdiv.style['boxShadow'] = '0px 0px 50px black';
		
		this.content.setStyle({cssFloat: 'none'});
		
		modal.outerdiv.appendChild(modal.innerdiv);
		
		// when the window is resized we're going to have to make sure the document body
		// is tall enough to accomodate our content.  Otherwise it will get cut off.
		Event.observe(window, 'resize', function (e) {
			if (modal.currentmodal) modal.currentmodal.resize();
		});
	}
	if (readCookie("modal_reload") == this.reloadid()) this.show();
}

modal.prototype.show = function() {
	if (modal.currentmodal) modal.currentmodal.hide(true);
	modal.outerdiv.setStyle({display: 'block'});
	this.content.setStyle({display: 'block', cssFloat: 'none'});
	modal.innerdiv.appendChild(this.content);
	this.resize();
	modal.currentmodal = this;
	createCookie("modal_reload", this.reloadid());
};

modal.prototype.hide = function(cleanup) {
	this.content.setStyle({display: 'none'});
	this.contentparent.appendChild(this.content);
	if (!cleanup) {
		modal.outerdiv.setStyle({display: 'none'});
		document.body.setStyle({height: 'auto'});
	}
	deleteCookie("modal_reload");
};

modal.prototype.toggle = function() {
	if (modal.shown() && this == modal.currentmodal) modal.currentmodal.hide();
	else this.show();
};

modal.box = function() {
	return modal.innerdiv;
};

modal.shown = function() {
	return (modal.outerdiv.getStyle('display') == 'block');
};

modal.prototype.resize = function() {
	if (!modal.shown()) return;
	var navh = modal.innerdiv.getHeight() + cssDim(modal.innerdiv.getStyle('margin-top'));
	var doch = getDocHeight();
	modal.outerdiv.setStyle({height: Math.max(navh, doch)+'px'});
	if (navh > doch) document.body.setStyle({height: navh+'px'});
	if (this.content.getStyle('width')) {
		modal.innerdiv.setStyle({width: this.content.getWidth()+'px'});
	}
};

modal.prototype.reloadid = function() {
	if (this.content.id != "") return '#'+this.content.id;
	return '.'+this.contentparent.className.split(' ').join('.') + ' ' + '.'+this.content.className.split(' ').join('.');
};

/**** MAGNOLIA-SPECIFIC ROUTINES ****/
modal.prototype.addToMainbar = function(title) {
	var mymodal = this;
	gatoedit.addGenericToMainbar(title, function () { mymodal.toggle(); });
};