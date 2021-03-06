module.exports = function( code, type ){

	var lint 		= require('csslint').CSSLint;	
	var errSwap 	= require('./CSSFriendlyErrz');	
	var cssDict 	= require('./css-properties-dictionary');
	var htmlDict 	= require('../html/html-elements-dictionary'); 
	var pseudoDict 	= require('./css-pseudo-classes-dictionary');

	
	var err = false;
	
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
	var selector = /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/;
	// "a { \nborder-radius:100px;color:red;\n }".replace(/\s/g,'').replace(/^.*{([^}]+)}.*/,'$1').match(/([^;]+)/g);
	// "a { \nborder-radius:100px;color:red;\n }".match(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/);


	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + UTILS + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 

	// via: http://stackoverflow.com/a/14865690/1104148
	function rulesForCssText(styleContent) {
		var doc = document.implementation.createHTMLDocument(""),
		styleElement = document.createElement("style");
		styleElement.textContent = styleContent;
		doc.body.appendChild(styleElement);
		return styleElement.sheet.cssRules;
	}

	function countBreaks(str){
		var br = 0;
		while( str.indexOf('\n')>=0 ){
			br++;
			str = str.substring( str.indexOf('\n')+1 );
		}
		return br;
	}

	function cleanUpArray( arr ){
		// removes any [undefined] && [""] from array
		var narr = [];
		for (var i = 0; i < arr.length; i++) {
			if( arr[i] && arr[i]!=="") narr.push( arr[i] );
		}
		return narr;
	}

	function getIdxOfSpecialChar( str ){ 
		var idx = false;
		var chars = ["[",'+','~',".","#",":"," "];
		for (var c = 0; c < chars.length; c++) {
			if( str.indexOf(chars[c])>=0 ){
				idx = str.indexOf(chars[c]);
				break;
			}
		}
		return idx;
	}

	function getLine(key, iter, sel){
		var sub;
		var line = 0;
		var cnt = parseInt(key[key.length-1])+1;
		// check if mixed html or plain css
		if( type == "css" ){
			sub = outline[key].str.substring( 0, outline[key].str.indexOf(sel));
			line += countBreaks(sub);
			return line;			
		} else {			
			for (var c = 0; c < cnt; c++) {
				if( c==cnt-1)
					line += outline['html'+c].brs;
				else
					line += outline['html'+c].brs + outline['css'+c].brs;		
			}
			sub = outline[key].str.substring( 0, outline[key].str.indexOf(sel));
			line += countBreaks(sub);
			return line;
		}
	}

	function confirmSel(ps,key,iter){
		var tag;
		var xcept = ['h1','h2','h3','h4','h5','h6',"*"];
		for( var p in pseudoDict ) xcept.push(p);

		if( ps[0]!=='.' && ps[0]!=='#' && ps[0]!=="@" ){
			var idx = getIdxOfSpecialChar( ps );
			if( idx ){
				tag = ps.substring(0,idx).trim();
			} else {
				tag = ps.trim();
			}
		}
		if( tag ){
			// if( tag[tag.length-1]=="," ) tag = 
			if( typeof htmlDict[tag]=='undefined' && xcept.indexOf(tag)<0 ){
				var m = '<span style="color:#F92672;font-weight:bold">'+tag+'</span>'+
						' is not a valid type selector, because that isn\'t an actual HTML element.'+
						' if this was meant to be a class or id selector don\'t forget the . or the #';
				var l =  getLine( key, iter, ps );
				return { message:m, line:l, html:m };
			}
		}
		return false;
	}

	function confirmSelector( key, iter, obj ){
		var st = obj.selectorText;
		var errObj, errObjs = [];
		// convert selector to array of "a, .test, div > p"
		var list = st.split(',');
		for (var i = 0; i < list.length; i++) {
			// piece apart each individual part, ex: "a div > b" -- [a,div,b]
			var pieces = list[i].split(/\s|\>|\+|\~(?!=)/);
			pieces = cleanUpArray(pieces);
			for (var p = 0; p < pieces.length; p++) {
				var e = confirmSel( pieces[p], key, iter );
				if( typeof e == "object" ) errObjs.push( e );
			}
		}

		if( errObjs.length > 0 ) return errObjs[0];
		else if( errObj ) return errObj;
		else return false;
	}

	function confirmProperties( key, iter, obj ){
		var st = obj.selectorText;
		var sel = outline[key].str.indexOf( st );
		// hack ( selectorText will add spaces between + && ~ selectors, it also replaces " " w/ "*" when global ) 
		// here's some kludgey accounting for that
		if( sel == -1 ){
			var adj = st.indexOf(" + ");
			var gen = st.indexOf(" ~ ");
			var glo = st.indexOf("*");
			if( gen > 0) st = st.replace(/\s\~\s/g,"~");
			if( adj > 0) st = st.replace(/\s\+\s/g,"+");
			if( glo >=0) st = st.replace(/\*/g,"");
			sel = outline[key].str.indexOf( st );
		} 
		var str = outline[key].str.substring( sel+st.length, outline[key].str.length );
			str = str.trim();
			str = str.substring( 1, str.indexOf('}'));
			str = str.replace(/\t/g,'').replace(/\s/g,'').replace(/\n/g,'');
		var strArr = str.split(';');  // array of properties via the outline str
		for (var i = 0; i < strArr.length; i++) {
			var strProp = strArr[i].substring( 0, strArr[i].indexOf(':') ).trim();
			if( strProp!=="" && typeof cssDict[strProp]==="undefined" ){
				var clr = (st[0]=="."|st[0]=="#") ? '#fff' : '#F92672';
				var m = ' the <span style="color:#64d6eb;font-weight:bold">'+strProp+'</span>'+
				' property in this <span style="color:'+clr+';font-weight:bold">'+st+'</span>'+
				' CSS rule isn\'t a valid CSS property. make sure you spelled it right';
				var l =  getLine( key, iter, st ); 
				return { message:m, line:l, html:m };
			}
		}
		return false;
	}


	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + PARSE + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 
	// ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ + ~ 


	var outline = { }; 	// in order to return the line number where the error occurs ( if any )
						// && to keep the CSS strings && objects  
	/*

	0	<html>							|
	1		<head>						|	outline = {
	2			<title> hey </title>	|		html0: { brs:3 }
	3			<style>					|		css0: {
	4				body { color:red }	|			brs:2,
	5			</style>				|			str:"body{color:red}",
	6			<meta charset="utf-8">	|			obj: DOMcssRules
	7			<style>					|		},
	8				a {					|		html1: { brs:2 },
	9					color:red		|		css1: {
	10				}					|			brs:4,
	11			</style>				|			str:"a{color:red}",
	12			<body></body>			|			obj: DOMcssRules 
	13	</html>							|		},
	------------------------------------|		html2: { brs:2 }
		total outline brs = 13			|	} 
	*/

	if( type=="html" ){

		// find all CSS && parse out html brs && CSS strs + brs into outline obj
		var pcnt = 0;
		while(code.indexOf("\<style") >= 0) {
			var cssStart = code.indexOf("\<style");
			var cssEnd = code.indexOf("\<\/style>");
			var cssCode = code.substring( cssStart, cssEnd );
			// code = code.substring(0, cssStart) + code.substring(cssEnd+8, code.length);			
			outline['html'+pcnt] = { brs:countBreaks(code.substring(0,cssStart)) };
			code = code.substring(cssEnd+8, code.length);
			cssCode = cssCode.substring( cssCode.match(startTag)[0].length, cssEnd );
			outline['css'+pcnt] = { str: cssCode, brs:countBreaks(cssCode) };
			pcnt++;
		}
		// what's left of the html if any
		if( code.length > 0 ){
			outline['html'+pcnt] = { brs:countBreaks(code) };
		}

	} else if( type=="css" ){

		// create outline obj ( assuming a css stylesheet && not css style tags inside html )
		outline.css0 = {
			brs: countBreaks(code),
			str: code
		};

	} else {
		throw new Error('CSSErrParser: type property must be either "html" or "css" ');
	}

	var errors = [];

	for( var key in outline ){
		// loop through every css object in the outline ( ie. every chunk of CSS on the page )
		if( key.indexOf('css')===0 ){

			var css = outline[key].str;
			var lintObj = lint.verify( css );

			for (var i = 0; i < lintObj.messages.length; i++) {
				if( lintObj.messages[i].type=="error" ){
					var errObj = {
						line: lintObj.messages[i].line,
						col: lintObj.messages[i].col,
						message: lintObj.messages[i].message,
						evidence: lintObj.messages[i].evidence,
						outline: { name:key, num:parseInt(key[key.length-1]) }
					};
					errors.push( errObj );
				}
			}

		}
	}


	// check for CSS Lint Errors
	if( errors.length > 0 ){
		// get line for css lint error
		var line = errors[0].line-1;
		// find line number relative to html page
		if( type=="html" ){
			var brCnt = 0;
			var num = errors[0].outline.num+1;
			for (var j = 0; j < num; j++) {
				if( j==num-1)
					line += outline['html'+j].brs;
				else
					line += outline['html'+j].brs + outline['css'+j].brs;
			}			
		}		
		// construct err object
		var msg = errSwap.check( errors[0] );
		err = {
			message: msg,
			line: line,
			html: msg
		};
	}

	// if no css lint errors... 
	if( !err ){

		// finish building the outline ( by adding the dom obj )
		for( key in outline ){
			if( key.indexOf('css')===0 ){
				outline[key].obj = rulesForCssText( outline[key].str );
			}
		}

		
		for( key in outline ){
			if( key.indexOf('css')===0){
				for (var s = 0; s < outline[key].obj.length; s++) {
					// confirm all type selectors are legit
					var confirm = confirmSelector(key, s, outline[key].obj[s]);
					if( !confirm ) confirm = confirmProperties(key, s, outline[key].obj[s]);
					if( confirm ){
						err = {
							message: confirm.message,
							line: confirm.line,
							html: confirm.message
						};
						break;
					}
				}
			}
		}


	}

	return err;

};

