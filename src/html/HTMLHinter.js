module.exports = function(cm, options){


	var cursor, line, start, end, alone, word, list;
	var mode = cm.getModeAt(cm.getCursor()).name;

	var snippets = {
		'a' : '<a href="#"></a>',
		'img' : '<img src="">',
		'link' : '<link rel="stylesheet" href="">',
		'doctype' : '<!DOCTYPE html>'
	};

	function reOrder( list, word ){
		var new_index = 0;
		var old_index;
		list.forEach(function(val,i){
			if( val.displayText == word ) old_index = i;
		});

		if( old_index ){
		    if (new_index >= list.length) {
		    	// via: http://stackoverflow.com/a/5306832/1104148
		        var k = new_index - list.length;
		        while ((k--) + 1) {
		            list.push(undefined);
		        }
		    }
		    list.splice(new_index, 0, list.splice(old_index, 1)[0]);
		    return list;
		} else {
			return list;
		}
	}

	function returnElementHint( elementsDict, word, cursor, start ){
		var holdClosest;
		for(var t in elementsDict ){
			// if word is in an element, add that element to the list
			if( t.indexOf(word)>=0 ){
				ctxt = (elementsDict[t].singleton) ? "<"+t+">" : "<"+t+"></"+t+">";
				if( typeof snippets[t]!=="undefined" ) ctxt = snippets[t];
				list.push({ text:ctxt, displayText:t });					
			} 
		}
		
		// make sure that word is always on top of list
		list = reOrder(list,word);

		return { 
			list:list,
			from: { line: cursor.line, ch: start },
			to: { line: cursor.line, ch: (word.length)+start+1 }
		};
	}

	function returnAttributeHint(attributesDict, word, cursor, start ){
		for(var a in attributesDict ) if( a.indexOf(word)>=0 ) list.push({ text:a+'=""', displayText:a });
		
		// make sure that word is always on top of list
		list = reOrder(list,word);

		return { 
			list:list,
			from: { line: cursor.line, ch: start },
			to: { line: cursor.line, ch: word.length+start }
		};	
	}



	// ---------------- HANDLES MIXED HTML / CSS / JS HINTING ----------------------------------------------



	if( mode == "javascript" ){ // --------------------------------------------------------------- JAVASCRIPT

		var jsHinter = options.jshinter;
		return jsHinter( cm, options );

	}
	
	else if( mode == "css" ){ // ----------------------------------------------------------------- CSS

		var cssHinter = options.csshinter;
		return cssHinter( cm, options );
		
	}

	else if( mode == "xml" ){ // ----------------------------------------------------------------- HTML 

		var elementsDict = require('./html-elements-dictionary');
		var attributesDict = require('./html-attributes-dictionary');

		cursor = cm.getCursor();
		line = cm.getLine(cursor.line);
		start = cursor.ch;
		end = cursor.ch;

		while (start && ( /\w/.test(line.charAt(start-1)) || line.charAt(start-1)=="<" ) ) --start;
		while (end < line.length && /\w/.test(line.charAt(end))) ++end;

		alone = (line.slice(end,end+1)==="" || line.slice(end,end+1)===" " ) ? true : false;
		word = line.slice(start, end).toLowerCase(); // word being typed

		if( word.length > 0 && alone ){

			list = [];
			var ctxt; // the text that should show up on autocomplete
				
			// are we writing an element name?
			if( word[0]=="<" || word.indexOf("</")===0 ){

				word = word.substring(1); // remove < from word
				return returnElementHint(elementsDict, word, cursor, start);
		
			} 
			// are we writing an attribute name?
			if( 	line.indexOf("<")>=0 && 
						line.indexOf("<")<line.indexOf(word) && 
						( line.indexOf(">")<0||line.indexOf(">")>line.indexOf(word) ) 
			){ 			

				return returnAttributeHint(attributesDict, word, cursor, start);

			} else {
				// otherwise assume element 
				return returnElementHint(elementsDict, word, cursor, start);
	
			}

			// return the autocomplete list && coordinates
			// return { 
			// 	list:list,
			// 	from: { line: cursor.line, ch: start },
			// 	to: { line: cursor.line, ch: word.length+start }
			// };	

		} 
	}
};