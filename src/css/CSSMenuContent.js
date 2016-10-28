module.exports = function( self ){

	var selector = /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/;
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;


	function getBefore( initP, m ){
		var pos = self.editor.findWordAt({ line:initP.anchor.line, ch:initP.anchor.ch-1 });
		var wrd = self.editor.getRange( pos.anchor, pos.head );
		if( !/[^\s]/.test(wrd) && initP.anchor.ch-1>m ){
			return getBefore( pos );
		} else {
			return wrd;
		}
	}

	function getAfter( initP, m ){		
		var pos = self.editor.findWordAt({ line:initP.head.line, ch:initP.head.ch });
		var wrd = self.editor.getRange( pos.anchor, pos.head );
		if( !/[^\s]/.test(wrd) && initP.head.ch<m ){
			return getAfter( pos );
		} else {
			return wrd;
		}
	}

	function getFullWord( obj ){
		var type = "property";
		var start = (obj) ? obj : self.editor.getCursor();
		var line = self.editor.getLine( start.line );
		var max =  line.length;
		var min = 0;
		var initP = self.editor.findWordAt(start);
		var initW = self.editor.getRange( initP.anchor, initP.head );
		var beforeW = getBefore( initP, min );
		var afterW = getAfter( initP, max );

		// check for selector
		if( line.indexOf("{")>=0 ){
			var selTest = [];
			// create array in case multiple selectors in a single rule
			var possibleSels = line.split(','); 
			for (var i = 0; i < possibleSels.length; i++) {
				var test = possibleSels[i];
				if( i < possibleSels.length-1 ) test += "{";
				var s = test.match(selector);
				if( s ) s = s[0].trim();
				if( s ) selTest.push( s );
			}

			for (var j = 0; j < selTest.length; j++) {
				if( selTest[j].match(startTag) ){ // remove style tag if right next to a selector
					selTest[j] = selTest[j].substr( selTest[j].match(startTag)[0].length, selTest[j].length );
				}

				if( selTest[j].indexOf(initW) >= 0 ){ // only send back the one that the cursor is on
					if( selTest[j][selTest[j].length-1] == "{" ) selTest[j] = selTest[j].substr(0,selTest[j].length-1);
					selTest[j] = selTest[j].trim();
					type = "selector";
					initW = selTest[j];
				}
			}
		}

		// check for property ( which is not selector )
		if( afterW=="-" && line.indexOf("{")<0 ){
			var apos = self.editor.findWordAt({ line:initP.head.line, ch:initP.head.ch });
			afterW = getAfter( apos, max );
			initW = initW+"-"+afterW;
		}

		if( beforeW=="-" && line.indexOf("{")<0 ){
			var bpos = self.editor.findWordAt({ line:initP.anchor.line, ch:initP.anchor.ch-1 });
			beforeW = getBefore( bpos, min );
			initW = beforeW+"-"+initW;
		}	

		return {
			word: initW,
			type: type
		};	
	}


	// return content -----------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------

	var obj = getFullWord();
	var word = obj.word;
	var type = obj.type;

	var cssProperties 			= require('./css-properties-dictionary');
	var cssSelectorBreakdown 	= require('./CSSSelectorBreakdown');
	var status, nfo, url, els, content;

	word = word.toLowerCase();

	if( cssProperties.hasOwnProperty( word ) && type=="property" ){

		url = cssProperties[word].url;
		nfo = cssProperties[word].nfo;
		nfo = nfo.replace(/</g,"&lt;");
		nfo = nfo.replace(/>/g,"&gt;");

		content = '<a href="'+url+'" target="_blank" style="color:#64d6eb">'+word+'</a> ';
		content += "<br><br>";
		content += nfo+' <a style="color:#dad06f;font-style:italic" href="'+url+'" target="_blank">(learn more)</a>';
		content += "<br><br>";
		content += '<a href="http://netart.rocks" target="_blank" style="color:#dad06f">http://netart.rocks</a>';

		return content;       

	} 

	else if( type=="selector"){

		var pieces = word.split(/(?=\.)|(?=\s\>\s)|(?=\+)|(?=\+)|(?=\~[^=])|(?=\s)|(?=\.)|(?=\#)/);
		
		content = cssSelectorBreakdown.getExplanation( pieces ); // should be content 
		
		// console.log('----------------');
		// console.log( content );
		// console.log( word );
		// console.log(pieces);
		// console.log(relatives);
		// console.log('----------------');

		return content; // for now
	}

	else {
		return false;
	}
	
};    

