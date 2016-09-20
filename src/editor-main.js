function WWWEditor( config ){

	this.CodeMirror = require('codemirror');
					  require('codemirror/addon/comment/comment');
					  require('codemirror/addon/search/searchcursor');
					  require('codemirror/addon/selection/mark-selection');
					  require('codemirror/addon/display/panel');
					  require('codemirror/addon/edit/matchbrackets');
					  require('codemirror/addon/edit/closebrackets');
					  require('codemirror/addon/hint/show-hint');
					  require('codemirror/mode/javascript/javascript');
					  require('codemirror/mode/htmlmixed/htmlmixed');
					  require('codemirror/keymap/sublime');
	var VP 			= require('./utils/BB.ValidateParam');

	// maybe mark-selection

	this.err = new VP(this, [
		// required ...
		{ param: config, name:'config', type:'object',  },
		{ param: config.id, type:'string', error:'param [id] should be an ide of an HTMLElement for the editor' },
		// optional ...
		{ param: config.preview, name:'preview', type:['undefined','string'] },
		{ param: config.friendlyErrors, name:'friendlyErrors', type:['undefined','boolean'] },
		{ param: config.uiTip, name:'uiTip', type:['undefined','boolean'] },
		{ param: config.supressRefErr, name:'supressRefErr', type:['undefined','boolean'] },
		{ param: config.autoUpdate, name:'autoUpdate', type:['undefined','boolean'] },
		{ param: config.updateDelay, name:'updateDelay', type:['undefined','number'] },
		{ param: config.modalCSS, name:'modalCSS', type:['undefined','object'] }
	]);


	// ----- editor && preview elements -------------------------------
	this.id = config.id;
	if(typeof config.preview !== 'undefined'){
		if( document.getElementById(config.preview) instanceof HTMLElement ) 
			this.preview = document.getElementById(config.preview);
		else 
			throw new Error('WWWEditor: param [preview] should be an id of an HTMLElement');		
	} else {
		this.preview = null;
	}


	// settings ------------------------------------------------------
	this.friendlyErrors = (typeof config.friendlyErrors==="undefined") ? false : config.friendlyErrors;
	this.uiTip 			= (typeof config.uiTip==="undefined") ? false : config.uiTip;
	this.supressRefErr 	= (typeof config.supressRefErr==="undefined") ? false : config.supressRefErr; // js only
	this.autoUpdate 	= (typeof config.autoUpdate ==="undefined") ? true : config.autoUpdate;
	this.modalCSS 		= (typeof config.modalCSS==="undefined") ? false : config.modalCSS;
	this.updateDelay 	= config.updateDelay || 500;

	this.updateLoop = null; // the update loop ( setTimeout )
	this.errWidgets = [];	// collection of err messages 
	this.helpWidgets = [];	// collection of help messages 
	this.nfoPanels = {};	// collection of info panels 
	this.firstError = (this.uiTip) ? true : false;
	this.firstMessage = (this.uiTip) ? true : false;
	this.modal = null;		// current modoal 


	// path to a js file, either passed as config param 
	// or from URL param else default to empty
	this.head = ''; 
	this.file = ( typeof config.file !=="undefined" ) ? config.file : ( this._URLParam.file ) ? this._URLParam.file : "empty";
	this.tail = '';


	// mode specifix ---------------------------------------------------
	if( config.type === "js" || config.type === "javascript" ){		
		this.mode = "javascript";
		//
		this.hinter = { 
			hint: this._jsHinter, 
			completeSingle:false, 
			parser:this.esprima 
		};
		console.log(this.hinter);
		//
		this.head +='<!DOCTYPE html><html><head><style>canvas{position:absolute;top:0;left:0;}body{background:white;}</style></head><body>';
		this.head += this._loadLibs( config );
		this.head += "<script>"; // possibly add \n
		//
		this.tail += '<\/script></body></html>';
	}
	else if( config.type === "css" ){
		// ----------------------
		// TODO FOR SOLO CSS FILES
		// ----------------------
	}
	else { // html/mixed
		this.mode = "htmlmixed";
		//
		this.markers = []; // holds error markers ( ie. highlited text )
		//
		this.hinter = { 
			hint: this._HTMLHinter, 
			completeSingle:false, 
			csshinter: this._CSSHinter,
			jshinter: this._jsHinter,
			parser:this.esprima 
		};
	}

	// ++++++++++++++++++++++++++++++++++++++++++++
	this._init();  			   // ---- INIT -------
	// ++++++++++++++++++++++++++++++++++++++++++++

}

// CONSTRUCTOR UTILS ----------------------------------
// ----------------------------------------------------

WWWEditor.prototype._URLParam = function() {
	// via http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter 
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if (typeof query_string[pair[0]] === "undefined") { query_string[pair[0]] = pair[1]; } 
		else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
		} else { query_string[pair[0]].push(pair[1]); }
	} return query_string;
}();

WWWEditor.prototype._loadLibs = function( config ){ // js only
	var prepend = '';
	if(typeof config.libs !== "undefined"){
		if( !(config.libs instanceof Array) ) throw new Error('WWWEditor: config param "libs" should be an instanceof Array');
		for (var i = 0; i < config.libs.length; i++) {
			prepend += '<script src="'+config.libs[i]+'"><\/script>';
		}
	}
	return prepend;
};



// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		++++++++++++++++ 	>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		 INIT FUNCTIONS 	>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		++++++++++++++++ 	>>>>>>>>>>>>>>>>>>>>>>>>>>>


WWWEditor.prototype._init = function() {
	var self = this;
	if( self.file === "empty" ){

		self._createEditor( "" );
		self.update();

	} else {

		var req = new XMLHttpRequest();
		req.open("GET", self.file, true);
		req.addEventListener("load", function() {

			self._createEditor( req.responseText );	// create editor
			self.update();							// initial update		

		});
		req.send(null);

	}

};

WWWEditor.prototype._createEditor = function( val ){

	var self = this;
	var target = document.getElementById( this.id );
	
	this.editor = this.CodeMirror( target, {
		value: val,
		mode: self.mode,
		lineNumbers: true,
		keyMap: 'sublime',
		styleSelectedText: true,
		matchBrackets: true,
		autoCloseBrackets: true,
		indentWithTabs: true,
		closeOnUnfocuse: false,
		hintOptions: self.hinter,
		tabSize: 4,
		indentUnit: 4,
		theme: 'bb-code-styles'
	});

	// EVENTS -----------------------------------------------

	if( this.autoUpdate ){							// on change
		
		this.editor.on( 'change', function() {
			clearTimeout( self.updateLoop );
			if( self.prevState!==self.editor.getValue() ){
				self.updateLoop = setTimeout( function(){
					self.update();
				}, self.updateDelay );
			}					
			self.prevState = self.editor.getValue();
		});			
	} else {

		this.editor.on( 'change', function() {		
			this.editor.showHint(); // >> self.hinter
		});
	}	

	this.editor.on('cursorActivity',function(e){	// on cursor move
		// clear all previous helper widgets
		self._clearWidgets("help");
		// if html mode...
		if( self.mode == "htmlmixed" ){
			self._htmlNfo(); // place gutter helper widgets
			self._hack4hint(); // adds xtra space in opening tag for attribute hints
		}
		
	});
};


// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		++++++++++++++++ 	>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		PUBLIC FUNCTIONS 	>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		++++++++++++++++ 	>>>>>>>>>>>>>>>>>>>>>>>>>>>

WWWEditor.prototype.load = function( path ){
	var self = this;
	// replace whatever is in the editor with the content of a particular file
	var req = new XMLHttpRequest();
		req.open("GET", path, true);
		req.addEventListener("load", function() {
			self.editor.setValue( req.responseText );
			self.update();	
		});
		req.send(null);
};

WWWEditor.prototype.addPanel = function(msg,where){
	var self = this;

	where = ( typeof where!=="undefined" ) ? where : "bottom";

	var pnl = document.createElement('div');
		pnl.id = "id"+Date.now();
		pnl.className = "cm-s-bb-code-styles";
		pnl.style.padding = "3px 7px";
		pnl.style.background = "#f7f7f7";
		pnl.style.color = "#333";
		pnl.style.borderBottom ="1px solid #ddd";
	var nfo = document.createElement('span');
		nfo.innerHTML = msg;
	var x = document.createElement('span');
		x.innerHTML = "✖";
		x.style.color = '#F92672';
		x.style.float = "right";
		x.style.cursor = "pointer";
		this.CodeMirror.on(x, "click", function() {
			self.nfoPanels[pnl.id].clear();
		});
	pnl.appendChild(nfo);
	pnl.appendChild(x);

	this.nfoPanels[pnl.id] = this.editor.addPanel(pnl,{position:where});
};

//
// -------  if autoUpdate is false, u're gonna have to run .update()
//			everytime u want to update ( validate + update preview + show hints )

WWWEditor.prototype.update = function(){

	var value = this.head + this.editor.getValue() + this.tail;

	if( this._validate() == "error free!")
		this._previewFrame( value );
	else 
		this._previewFrame( " !!! ERROR: (>_<) OH NO !!! " );

	if( this.autoUpdate ){		
		this.editor.showHint(); // >> self.hinter
	}

};


// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		++++++++++++++++ 	>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		PRIVATE FUNCTIONS 	>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>> 		++++++++++++++++ 	>>>>>>>>>>>>>>>>>>>>>>>>>>>


WWWEditor.prototype._clearWidgets = function( type ) {
	if( type=="err" || typeof type=="undefined"){
		// clear all previous error widgets
		for (var i = 0; i < this.errWidgets.length; i++) 
			this.errWidgets[i].clear();
		this.errWidgets = [];
	}
	if( type=="help" || typeof type=="undefined" ){
		// clear all previous helper widgets
		for (var j = 0; j < this.helpWidgets.length; j++) 
			this.helpWidgets[j].clear();
		this.helpWidgets = [];			
	}
};

WWWEditor.prototype._validate = function(){

	var code = this.editor.getValue();
	var errors;

	// clear all previous error widgets
	this._clearWidgets("err");

	// validate code
	if( this.mode == "javascript" ) 	return this._jsValidate(code);
	else if( this.mode === "htmlmixed") return this._htmlValidate(code);
};

WWWEditor.prototype._previewFrame = function( value ){
	if( this.preview !== null ){
	
		if ( this.preview.children.length > 0 ) 
			this.preview.removeChild( this.preview.firstChild ); 

		var iframe = document.createElement( 'iframe' );
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.style.border = '0';
		
		this.preview.appendChild( iframe );
		
		var content = iframe.contentDocument || iframe.contentWindow.document;
			content.open();
			content.write( value );
			content.close();
	}
};


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ *\
|								|
|				CSS 			|
|								|
\* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

WWWEditor.prototype._getCSSnfo = require('./css/CSSMenuContent');	// for nfo modal content
WWWEditor.prototype._CSSHinter = require('./css/CSSHinter');		// for hinting ( ie. auto-complete suggestions )


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ *\
|								|
|				HTML 			|
|								|
\* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

WWWEditor.prototype._htmlParser	= require('./html/HTMLParser');		// for parsing ( && spotting errors )
WWWEditor.prototype._modal 		= require('./utils/NfoModal');		// for err/nfo pop ups
WWWEditor.prototype._getHTMLnfo	= require('./html/HTMLMenuContent');// for nfo modal content
WWWEditor.prototype._HTMLHinter	= require('./html/HTMLHinter');		// for hinting ( ie. auto-complete suggestions )

WWWEditor.prototype._hack4hint = function() {
	// when ur cursor is here: <tag|>
	// and u hit spacebar to begin writing an attr: <tag |>
	// it ads a space like this: <tag | >
	// so that the attribute autocomplete will work
	var cur = this.editor.getCursor();
	var line = this.editor.getLine(cur.line);
	var leftChar = this.editor.getLine(cur.line)[cur.ch-1];
	var rightChar = this.editor.getLine(cur.line)[cur.ch];

	var end = cur.ch;
	var start = cur.ch;
	while (start && (/\w/.test(line.charAt(start-1))||line.charAt(start-1)==" " ) ) --start;
	if( line[start-1]=="<" ){
		var tag = line.substring(start,end);
		if( rightChar==">" && leftChar==" " ){ 
			this.editor.replaceSelection(" ");
			this.editor.setSelection({line:cur.line,ch:cur.ch},{line:cur.line,ch:cur.ch});
		}
	}
};

WWWEditor.prototype._htmlWidget = function( char, colorOver, colorOut ){
	// creates gutter widget 
	var widg = document.createElement('div');
		widg.style.color = colorOut;
		widg.onmouseover = function(){ this.style.color = colorOver;};
		widg.onmouseout = function(){ this.style.color = colorOut;};
		widg.innerHTML = char; //"☞";
		widg.style.fontSize = this.editor.defaultTextHeight()+"px";
		widg.style.marginLeft = "-"+this.editor.defaultTextHeight()*1.8+"px";
		widg.style.marginTop = "-"+this.editor.defaultTextHeight()+"px";
		widg.style.padding = "3px "+this.editor.defaultTextHeight()/2+"px";
		widg.style.zIndex = 1000;
		widg.style.cursor = "pointer";
	return widg;
};

WWWEditor.prototype._htmlNfoWidget = function( lineNumber, message ){
	var self = this;
	if( message ){
		// create gutter widget
		var nfoHelp = this._htmlWidget("&#65533;","rgba(255,255,255,0.8)","rgba(255,255,0,0.6)");
			nfoHelp.onclick = function(){
				// remove previous modal ( if it exists )
				if( self.modal ) self.modal = self.modal.remove();			
				// create new modal
				var mcss = (self.modalCSS) ? self.modalCSS : undefined;
				self.modal = new self._modal({
					html: message,
					type: "help",
					editor: self,
					css: mcss
				});
			};
			nfoHelp.clear = function(){
				this.parentElement.removeChild( this );
			};

		var widget = this.editor.addWidget({line:lineNumber,ch:0}, nfoHelp );
		this.helpWidgets.push( nfoHelp );
	}
};

WWWEditor.prototype._htmlNfo = function() { // trigered when cursor changes positions
	var self = this;

	function getWrd( offset ){
		var getPosition = self.editor.findWordAt({line:pos.anchor.line,ch:pos.anchor.ch+offset});
		var getWord 	= self.editor.getRange( getPosition.anchor, getPosition.head );
		return getWord;
	}

	if( this.errWidgets.length <= 0 ){
		// if there are no errors present, create nfo widget
		var pos = this.editor.findWordAt(this.editor.getCursor());
		var wrd = this.editor.getRange( pos.anchor, pos.head );
		if( wrd == ">" || wrd == "/>") 
			wrd = this.editor.getRange( pos.anchor, {line:pos.head.line,ch:pos.head.ch-1});

		var content;
		// exit if wrd is inside js or css
		var mode = this.editor.getModeAt( pos.head ).name;
		if( mode=="javascript") {
			content = "sorry js coming soon";
			return;
		} else if( mode=="css" ){
			// get char after ( looking for : to confirm it's a property )
			var afChar = getWrd(wrd.length);
			if( afChar==="-" ){ // in case it's a prop like: background-color
				afChar = getWrd(wrd.length+1);
				wrd = wrd +"-"+afChar;
				afChar = getWrd(wrd.length);
			}
			if( afChar[0]===" " ) afChar = getWrd(wrd.length+afChar.length);
			content = this._getCSSnfo( wrd, afChar );
		
		} else { // html
			// get char before word ( looking for "<" or "</" )
			var preChar = getWrd(-1);
			content = this._getHTMLnfo( wrd, preChar );
		}
		
		// create gutter widget
		this._htmlNfoWidget( pos.head.line, content ); // this is also CSS Nfo Widget

		// if modal is present, remove it
		if( this.modal ) {
			this.modal = this.modal.remove();
			if( this.helpWidgets.length>0 ) // && replace w/new one
				this.helpWidgets[this.helpWidgets.length-1].click();
		}
	}
};


WWWEditor.prototype._htmlErrWidget = function( lineNumber, message ){
	var self = this;
	// create gutter widget
	var errHelp = this._htmlWidget("&#65533;","rgba(255,255,255,0.8)","rgba(255,0,0,0.6)");
		errHelp.onclick = function(){
			// remove previous modal
			if( self.modal ) self.modal = self.modal.remove();			
			// create new modal 
			var mcss = (self.modalCSS) ? self.modalCSS : undefined;
			self.modal = new self._modal({
				html: message,
				type: "err",
				editor: self,
				css: mcss
			});
			if( self.firstMessage ){
				self.firstMessage = false;
				self.addPanel("hover over any links in the modal for details on tags/attributes");
				self.addPanel("click a tag to see even more info on that particular element");
			}
		};
		errHelp.clear = function(){
			this.parentElement.removeChild( this );
		};

	var widget = this.editor.addWidget({line:lineNumber,ch:0}, errHelp );
	this.errWidgets.push( errHelp );
};


WWWEditor.prototype._htmlValidate = function(code){
	if( this.friendlyErrors ){
		// clear previous widgets && modals
		this._clearWidgets();
		if( this.modal ) this.modal = this.modal.remove();

		// create html parser if first time validating
		if( typeof this.html === "undefined") this.html = new this._htmlParser();

		// clear previous markers ( ie. highlighted errors )
		if( this.markers.length>0 )
			for (var i = 0; i < this.markers.length; i++) this.markers[i].clear();

		// parse html && check for errors
		var err = this.html.parse( code );
		if( err ){	
			// get line number	
			var num, brs = err.code.match(/\n/g);
			if( !brs ) num = this.editor.lineCount()-1;
			else num = this.editor.lineCount() - brs.length -1;

			// create nfoPanel if first time an error appears
			if( this.firstError ){
				this.firstError = false;
				this.addPanel("you made your first mistake! hurray :)");	
				this.addPanel("click the diamond question mark to open a modal with more info");
			} 

			// create error widget + console warning
			this._htmlErrWidget( num, err.html );
			console.warn( "line "+(num+1)+": "+ err.text );

			// mark text ( ie. highlight red area )
			this.markers.push(
				this.editor.markText({line:num,ch:0}, {line:num,ch:null}, {className: "styled-background"})
			);
		} 
	}

	return "error free!";
};


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ *\
|								|
|			JavaScript 			|
|								|
\* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

WWWEditor.prototype.esprima 	= require('esprima'); 			// for parsing ( && spotting errors )
WWWEditor.prototype._jsHinter 	= require('./js/JSHinter');		// for hinting ( ie. auto-complete suggestions )
WWWEditor.prototype._refErrz 	= require('./js/RefErrz');		// for reference errors ( missing from esprima )
WWWEditor.prototype.errSwap	= require('./js/FriendlyErrz'); // for optional friendlier errors 

WWWEditor.prototype._jsErrMessage = function( err ){

	var message = err.description;

	if( this.friendlyErrors )
		message = this.errSwap.check( err.description );

	this._jsErrWidget( err.lineNumber-1, message );
};

WWWEditor.prototype._jsErrWidget = function( lineNumber, message ){

	var errMsg = document.createElement('div');
		errMsg.style.background = "rgba(255,0,0,0.3)";
		errMsg.style.color = "#d8d8d8";
		errMsg.style.padding = "0px 3px";
		errMsg.innerHTML = " Error: " + message;

	var widget = this.editor.addLineWidget( lineNumber, errMsg, {coverGutter:true} );
	this.errWidgets.push( widget );
};

WWWEditor.prototype._jsValidate = function(code){

	// check for errors 
	try {
		var syntax = this.esprima.parse(code, { tolerant: true });
	    errors = syntax.errors;
	} 
	catch (e){
		// bug...
		// catch the errz that don't show up in errors snytax.errors object
	 	this._jsErrMessage( e );
	}


	// errz that are picked up by syntax.errors object
	if( errors instanceof Array && errors.length>0){
		for (var j = 0; j < errors.length; j++) {
			this._jsErrMessage( errors[j] );
		}
    } else if( !this.supressRefErr ){
    	// find reference errors ( which for some reason aren't caught by esprima )
		var re = this._refErrz();
		if( typeof re=="object") this._jsErrMessage( re );
		else return re;
    	
    } else {
    	return "error free!"; 
    }


};



// -----------------------------------------------------------


window.WWWEditor = WWWEditor;

// TODO: 

// JS
// work on friendly errz 
// make learnable programming stuff 
// add function names to autocomplete in 
// find a way to tell if someone meant to write a sting? ie. when referr


// HTML
// make nfo modal for doctype ... maybe link to video?
// once parsing css && js:
// 	class= autocomplete w/existing classes
// 	id= autocomplete w/existing ids 
// 	css: ^ same sorta autocomplete on the other end?


// CSS
// widgets ( color, position )
// info widgets for stuff inside style/script tags ( currently being ignored, in _htmlNfo )
