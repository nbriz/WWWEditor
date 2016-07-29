module.exports = {
	// 'Unexpected token %0' : 'is that %0 supposed to be there?',
	// 'Unexpected token ILLEGAL' : '',
	// 'Unexpected number' : '',
	// 'Unexpected string' : '',
	// 'Unexpected identifier' : '',
	// 'Unexpected reserved word' : '',
	// 'Unexpected quasi %0' : '',
	'Unexpected end of input' : 'looks you\'re missing something. did you forgt to close a bracket?',
	// 'Illegal newline after throw' : '',
	// 'Invalid regular expression' : '',
	// 'Invalid regular expression: missing /' : '',
	// 'Invalid left-hand side in assignment' : '',
	// 'Invalid left-hand side in for-in' : '',
	// 'Invalid left-hand side in for-loop' : '',
	// 'More than one default clause in switch statement' : '',
	// 'Missing catch or finally after try' : '',
	// 'Undefined label \'%0\'' : '',
	// '%0 \'%1\' has already been declared' : '',
	// 'Illegal continue statement' : '',
	// 'Illegal break statement' : '',
	'Illegal return statement' : 'you can\'t put a "return" statement there, those can only go inside of functions',
	// 'Strict mode code may not include a with statement' : '',
	// 'Catch variable may not be eval or arguments in strict mode' : '',
	// 'Variable name may not be eval or arguments in strict mode' : '',
	// 'Parameter name eval or arguments is not allowed in strict mode' : '',
	// 'Strict mode function may not have duplicate parameter names' : '',
	// 'Function name may not be eval or arguments in strict mode' : '',
	// 'Octal literals are not allowed in strict mode.' : '',
	// 'Delete of an unqualified identifier in strict mode.' : '',
	// 'Assignment to eval or arguments is not allowed in strict mode' : '',
	// 'Postfix increment/decrement may not have eval or arguments operand in strict mode' : '',
	// 'Prefix increment/decrement may not have eval or arguments operand in strict mode' : '',
	// 'Use of future reserved word in strict mode' : '',
	// 'Octal literals are not allowed in template strings.' : '',
	// 'Rest parameter must be last formal parameter' : '',
	// 'Unexpected token =' : '',
	// 'Unexpected token {' : '',
	// 'Duplicate __proto__ fields are not allowed in object literals' : '',
	// 'Class constructor may not be an accessor' : '',
	// 'A class may only have one constructor' : '',
	// 'Classes may not have static property named prototype' : '',
	// 'Duplicate binding %0' : '',
	check: function( err ){
		if( typeof this[err] !=='undefined' ) {
			
			return this[err];
		
		} else if(err.indexOf('ILLEGAL')>=0){			
			
			return 'looks like you\'re using a character that isn\'t part of javascript';
		
		} else if( err.indexOf('Unexpected token ')>=0) {
			
			var token = err.substring( 17, err.length );
			
			return 'seems there\'s an out of place <span style="color:#fff;font-weight:bold">'+
			token+'</span>, are you using it right? maybe you\'re missing something just before/above it?';
		
		} else {
			return err;
		}
	}
};
