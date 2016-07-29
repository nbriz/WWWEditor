module.exports = function(cm, options){
	

	var elementsDict = require('./html-elements-dictionary');
	var attributesDict = require('./html-attributes-dictionary');

	var cursor = cm.getCursor(), line = cm.getLine(cursor.line);
	var start = cursor.ch, end = cursor.ch;
	
	while (start && ( /\w/.test(line.charAt(start-1)) || line.charAt(start-1)=="<" ) ) --start;
	while (end < line.length && /\w/.test(line.charAt(end))) ++end;

	var alone = (line.slice(end,end+1)==="" || line.slice(end,end+1)===" " ) ? true : false;
	var word = line.slice(start, end).toLowerCase(); // word being typed

	if( word.length > 0 && alone ){

		var list = [];
		var ctxt; // the text that should show up on autocomplete
			
		// are we writing an element name?
		if( word[0]=="<" || word.indexOf("</")===0 ){

			word = word.substring(1); // remove < from word

			for(var t in elementsDict ){
				// if word is in an element, add that element to the list
				if( t.indexOf(word)>=0 ){
					ctxt = (elementsDict[t].singleton) ? "<"+t+">" : "<"+t+"></"+t+">";
					list.push({ text:ctxt, displayText:t });					
				} 
			}
			
			return { 
				list:list,
				from: { line: cursor.line, ch: start },
				to: { line: cursor.line, ch: (word.length)+start+1 }
			};
	
		} 
		// are we writing an attribute name?
		else if( 	line.indexOf("<")>=0 && 
					line.indexOf("<")<line.indexOf(word) && 
					( line.indexOf(">")<0||line.indexOf(">")>line.indexOf(word) ) 
		){ 			

			for(var a in attributesDict ) if( a.indexOf(word)>=0 ) list.push({ text:a+'=""', displayText:a });
			return { 
				list:list,
				from: { line: cursor.line, ch: start },
				to: { line: cursor.line, ch: word.length+start }
			};	
		}

		// return the autocomplete list && coordinates
		// return { 
		// 	list:list,
		// 	from: { line: cursor.line, ch: start },
		// 	to: { line: cursor.line, ch: word.length+start }
		// };	

	} 
};