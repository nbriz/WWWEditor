module.exports = function(){

	var usrVars = [];
	var editor = this.editor;
	var esprima = this.esprima;

	// find all variable declerations
	for (var i = 0; i < editor.lineCount(); i++) {		
		if( editor.getLine(i).indexOf(';')>=0 ||  
			editor.getLine(i).indexOf('let ')>=0 ||
			editor.getLine(i).indexOf('const ')>=0 ||
			editor.getLine(i).indexOf('var ')>=0 ){

			var o = esprima.parse( editor.getLine(i) ).body[0];
			
			if( o.type == "VariableDeclaration" ){
				for (var d = 0; d < o.declarations.length; d++) {
					usrVars.push( o.declarations[d].id.name );
				}
			} 
		}
	}

	// compare expressions to variable declarations to find reference errors
	for (var j = 0; j < editor.lineCount(); j++) {
		if( editor.getLine(j).indexOf('{')<1 &&  
			editor.getLine(j).indexOf('}')<0 &&
			editor.getCursor().line !== j
			){

			var obj = esprima.parse( editor.getLine(j) ).body[0];
			
			if(typeof obj!=="undefined" && obj.type == "ExpressionStatement"){
				if( obj.expression.type == "Identifier"){
					if( usrVars.indexOf(obj.expression.name)<0 && Object.keys( window ).indexOf(obj.expression.name)<0 ){
						if( this.friendlyErrors ){
							return { lineNumber:j+1, description:obj.expression.name+" is not defined, don't forget to use 'var' the first time you declare a variable" };
						} else {
							return { lineNumber:j+1, description:obj.expression.name+" is not defined" };
						}
						
					}
				}
			}
		}
	}

	return "error free!"; 


	// TODO: add function declerations here

	// TODO: also try to intellegently figure out if the ref err was b/c they meant to write a string? ( common mistake w/students )
};


