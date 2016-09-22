module.exports = (function(){
    'use strict';

    function NfoModal( config ){
    	var self = this;

    	var html = config.html;
    	var css = config.css;
    	var editor = config.editor;
    	var element = document.getElementById( editor.id );
    	var type = config.type || "help";

    	this.clr = {
    		red: '#F92672',
    		blue: '#64d6eb',
    		green: '#a6da27',
			purple: '#ae81f2',
			yellow: '#dad06f',
			dark: '#272822',
			light: '#75715E'
    	};

    	this.startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
		this.endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/;
    	this.elementsDict = require('../html/html-elements-dictionary');
		this.attributesDict = require('../html/html-attributes-dictionary');

		// create modal menu -----
		this.close = document.createElement('div');
    	this.close.innerHTML = "✖";
    	this.close.style.color = this.clr.red;
    	this.close.style.margin = "-9px -3px 0 0";
    	this.close.style.textAlign = "right";
    	this.close.style.cursor = "pointer";
    	this.close.onclick = function(){
    		editor.modal = editor.modal.remove();
    	};

    	// create element
    	this.ele = document.createElement('div');
    	this.container = document.createElement('div');
    	this.ele.appendChild( this.close );
    	this.ele.appendChild( this.container );
    	

    	this.default = {
    		position: 'absolute',
    		zIndex: 9999999, 
    		top: element.getBoundingClientRect().top+"px",
    		right: element.getBoundingClientRect().right+"px",
			boxShadow: "-3px 3px 2px 0 rgba(0, 0, 0, 0.5)",
			webkitBoxShadow: "-3px 3px 2px 0 rgba(0, 0, 0, 0.5)",
			padding: "10px",
			background: 'rgba(39,40,34,0.9)', // same as self.clr.dark, but transparent
			color: '#fff',
			width: '330px',
			// maxHeight: window.innerHeight/2+'px',
			fontWeight: 300
		};

    	// style element
    	if( typeof css == "object" ) this._parseCSS( css );
    	else if(typeof css == "undefined"){
    		this.ele.className = "cm-s-bb-code-styles";
    		this._parseCSS( this.default );
    	}
    	else throw new Error('NfoModal: css param should be an object');
    	
    	// add content to element 
    	// ( maybe add type param, so that it uses _parseHTMLstring only if html type, && other methods for other types )
    	if( typeof html == "string" ) this.container.innerHTML = html;
    	else if( html instanceof HTMLElement ) this.container.appendChild( html );
    	else throw new Error('NfoModal: requires at least one param, string or HTMLElement to place in modal');

        // hack: add scroll bar if necessary
        // setTimeout(function(scope){ 
        //     if( scope.ele.offsetHeight > window.innerHeight/2 +10 )
        //         scope.ele.style.overflowY = "scroll";
        // },100, this );


    	// add to body 
    	document.body.appendChild( this.ele );

    }

    NfoModal.prototype._parseCSS = function( css ) {
    	for( var key in css ) this.ele.style[key] = css[key];
    };

    NfoModal.prototype.remove = function() {
    	document.body.removeChild( this.ele );
    	return null;
    };

	return NfoModal;

}());    