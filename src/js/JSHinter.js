module.exports = function(cm, options){
	
	function getUsrVars(editor,esprima){
		var usrVars = [];
		for (var i = 0; i < editor.lineCount(); i++) {
			if( editor.getLine(i).indexOf(';')>=0 ||  
				editor.getLine(i).indexOf('let ')>=0 ||
				editor.getLine(i).indexOf('const ')>=0 ||
				editor.getLine(i).indexOf('var ')>=0 ){

				var obj = esprima.parse( editor.getLine(i) ).body[0];
				
				if( obj.type == "VariableDeclaration" ){
					for (var d = 0; d < obj.declarations.length; d++) {
						usrVars.push( obj.declarations[d].id.name );
					}

				} else if (obj.type == "ExpressionStatement"){
					if( obj.expression.type == "AssignmentExpression")
						usrVars.push( obj.expression.left.name );
				}
			}
		}
		return usrVars;
	}

	var winVarList = Object.keys( window );
	var usrVarList = getUsrVars (cm, options.parser );
	var jsHintList = winVarList.concat(usrVarList);

	var cursor = cm.getCursor(), line = cm.getLine(cursor.line);
	var start = cursor.ch, end = cursor.ch;
	
	while (start && /\w/.test(line.charAt(start - 1))) --start;
	while (end < line.length && /\w/.test(line.charAt(end))) ++end;

	var alone = (line.slice(end,end+1)==="" || line.slice(end,end+1)===" " ) ? true : false;
	var word = line.slice(start, end).toLowerCase(); // word being typed

	if( word.length > 0 && alone ){

		var list = [];
		for (var i = 0; i < jsHintList.length; i++){ 
			if (jsHintList[i].indexOf(word) != -1) list.push(jsHintList[i]);
		}
		//console.log({ line: cursor.line, ch: start }, { line: cursor.line, ch: word.length+start });
		return { 
			list:list,
			from: { line: cursor.line, ch: start },
			to: { line: cursor.line, ch: word.length+start }
		};	
	} 
};