module.exports = function( self ){

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
		var start = (obj) ? obj : self.editor.getCursor();
		var max = self.editor.getLine( start.line ).length;
		var min = 0;
		var initP = self.editor.findWordAt(start);
		var initW = self.editor.getRange( initP.anchor, initP.head );
		var beforeW = getBefore( initP, min );
		var afterW = getAfter( initP, max );
		

		// console.log(beforeW,initW,afterW);
	}

	var word = getFullWord();


	// get char after ( looking for : to confirm it's a property )
	// var afChar = getWrd("after",pos);
	
	// if( afChar==="-" ){ 
	// 	// in case it's a prop like: background-color
	// 	afChar = getWrd(wrd.length+1);
	// 	wrd = wrd +"-"+afChar;
	// 	afChar = getWrd(wrd.length);
	// }
	// if( afChar[0]===" " ) afChar = getWrd(wrd.length+afChar.length);


	// return content -----------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
	// --------------------------------------------------------------------------------------------------------------
/*
	var word = obj.word;
	var type = obj.type;

	var cssProperties = require('./css-properties-dictionary');
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
		// then it's a selector!
		console.log( 'selector!' );
		return false; // for now
	}

	else {
		return false;
	}
	*/
};    