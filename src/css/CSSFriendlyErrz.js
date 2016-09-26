module.exports = {
	// CSS Lint Error Messages
	'Expected' : '',
	"Expected end of string" : '',
	"Expected a `FUNCTION` or `IDENT` after colon at line " : '',
	"Expected a hex color but found ": '',	
	"Unknown @ rule." : '',
	"@charset not allowed here." : '',
	"@import not allowed here." : '',
	"@namespace not allowed here." : '',
	"Unexpected token '" : '',
	check: function( error ){
		var token;
		var err = error.message;
		var col = error.col;
		var txt = error.evidence;

		if( err.indexOf("Expected")===0 ){

			token = '[ '+txt[col];
			if( txt[col+1] ) token += txt[col+1];
			if( txt[col+2] ) token += txt[col+2];
			if( txt[col+3] ) token += txt[col+3];
			token += " ]";
			if( txt[col]==";") token = "property's value";

			return 'woops, something went wrong, possibly around the <span style="color:#fff;font-weight:bold">'+ token+
			'</span>, make sure you\'re syntax is right, check all your { } : and ; on this line or the line just above.';

		} else if( err.indexOf('Unexpected token ')>=0) {
			
			var idx = err.indexOf('at');
			token = err.substring( 17, idx );
			
			return 'seems there\'s an out of place <span style="color:#fff;font-weight:bold">'+
			token+'</span>here, are you using it right? maybe you\'re missing something just before/above it?';
		
		} else {
			return err;
		}
	}
};