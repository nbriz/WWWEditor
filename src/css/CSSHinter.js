module.exports = function(cm, options){

	var cssProperties = require('./css-properties-dictionary');

	var cursor = cm.getCursor(), line = cm.getLine(cursor.line);
	var start = cursor.ch, end = cursor.ch;
	
	while (start && /\w/.test(line.charAt(start - 1))) --start;
	while (end < line.length && /\w/.test(line.charAt(end))) ++end;

	var alone = (line.slice(end,end+1)==="" || line.slice(end,end+1)===" " ) ? true : false;
	var word = line.slice(start, end).toLowerCase(); // word being typed

	if( word.length > 0 && alone ){

		var list = [];
		for(var p in cssProperties ) if( p.indexOf(word)>=0){
			var prop = p.split(' ')[0];
			if( prop[0]!=="@" && list.indexOf(prop)<0 ) list.push(prop);
		}

		//console.log({ line: cursor.line, ch: start }, { line: cursor.line, ch: word.length+start });
		return { 
			list:list,
			from: { line: cursor.line, ch: start },
			to: { line: cursor.line, ch: word.length+start }
		};	
	} 	

};