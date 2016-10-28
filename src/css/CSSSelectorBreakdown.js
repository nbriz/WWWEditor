module.exports = {
	
	cssPseudoClasses: require('./css-pseudo-classes-dictionary'),
	cssPseudoElements: require('./css-pseudo-elements-dictionary'),
	htmlElements: require('../html/html-elements-dictionary.js'),
	
	// pseudo elements map
	'::after'			: 'the area just before ',
	'::before'			: 'the area just after ',
    '::first-letter'	: 'the first letter of ',
    '::first-line'		: 'the first line of ',
    '::selection'		: 'the highlighted part of ',
    '::backdrop'		: 'the area below ',
    '::placeholder'		: 'any placeholder text of ',
    '::marker'			: 'the list bullet of ',
    '::spelling-error'	: 'a spelling error in ',
    '::grammar-error'	: 'a grammer error in ',
    
    // pseudo classes map
	':active' 				: ' that has been activated',
    ':any()' 				: ' which meets the "any()" criteria',
    ':checked' 				: ' which has been checked',
    ':default' 				: ' which meets the "default" criteria',
    ':dir()' 				: ' which meets the "dir()" criteria',
    ':disabled' 			: ' which meets the "disabled" criteria',
    ':empty' 				: ' which has no children',
    ':enabled' 				: ' which meets the "enabled" criteria',
    ':first' 				: ' which meets the "first" criteria',
    ':first-child' 			: ' which is the first child of its parent',
    ':first-of-type' 		: ' which is the first sibling of this type',
    ':fullscreen' 			: ' which meets the "fullscreen" criteria',
    ':focus' 				: ' which is currently focused',
    ':hover' 				: ' which is being hovered over',
    ':indeterminate' 		: ' which meets the "indeterminate" criteria',
    ':in-range' 			: ' which meets the "in-range" criteria',
    ':invalid' 				: ' which meets the "invalid" criteria',
    ':lang()' 				: ' which meets the "lang()" criteria',
    ':last-child' 			: ' which is the last child of its parent',
    ':last-of-type' 		: ' which is the last sibling of this type',
    ':left' 				: ' which meets the "left" criteria',
    ':link' 				: ' which meets the "link" criteria',
    ':not()' 				: ' which meets the "not()" criteria',
    ':nth-child()' 			: ' which is the "nth" child of its parent',
    ':nth-last-child()' 	: ' which is the "nth" child of its parent',
    ':nth-last-of-type()' 	: ' which is the "nth" child of its parent',
    ':nth-of-type()' 		: ' which meets the "nth-of-type()" criteria',
    ':only-child' 			: ' which is the only child of its parent',
    ':only-of-type' 		: ' which is the only sibling of this type',
    ':optional' 			: ' which meets the "optional" criteria',
    ':out-of-range' 		: ' which meets the "out-of-range" criteria',
    ':read-only' 			: ' which meets the "read-only" criteria',
    ':read-write' 			: ' which meets the "read-write" criteria',
    ':required' 			: ' which meets the "required" criteria',
    ':right' 				: ' which meets the "right" criteria',
    ':root' 				: ' which meets the "root" criteria',
    ':scope' 				: ' which meets the ""scope"" criteria',
    ':target' 				: ' which meets the target criteria',
    ':valid' 				: ' which meets the "valid" criteria',
    ':visited' 				: ' which has already been visited',

    _isVowel: function( val ){
    	if( val=="a"||val=="e"||val=="i"||val=="o"||val=="u") return true;
    	else return false;
    },

    _strip: function(html){ // FOR DEBUG ONLY-------------- consloe.log(strip())
	   var tmp = document.createElement("DIV");
	   tmp.innerHTML = html;
	   return tmp.textContent || tmp.innerText || "";
	},

    _parseAttrSel: function(str){
    	var sel = str.substr(str.indexOf('[')+1,str.indexOf(']')-str.indexOf('[')-1);
    	var p, a, v;
    	var lnk = '<a href="http://netart.rocks/notes/cssoverview#attribute-selectors" target="_blank" style="color: #dad06f">';
		if( str.indexOf("^=")>=0){
			p = sel.split("^=");
			a = (this._isVowel(p[0][0])) ? "an " : "a ";
			v = 'with '+a+lnk+p[0]+' attribute</a> who\'s value starts with a '+p[1]+' ';
		} else if(str.indexOf("~=")>=0){
			p = sel.split("~=");
			a = (this._isVowel(p[0][0])) ? "an " : "a ";
			v = 'with '+a+lnk+p[0]+' attribute</a> who\'s value includes '+p[1]+' in a space separated list ';
		} else if(str.indexOf("*=")>=0){
			p = sel.split("*=");
			a = (this._isVowel(p[0][0])) ? "an " : "a ";
			v = 'with '+a+lnk+p[0]+' attribute</a> who\'s value conains the substring '+p[1]+' ';
		} else if(str.indexOf("$=")>=0){
			p = sel.split("$=");
			a = (this._isVowel(p[0][0])) ? "an " : "a ";
			v = 'with '+a+lnk+p[0]+' attribute</a> who\'s value ends with a '+p[1]+' ';
		} else if(str.indexOf("=")>=0){
			p = sel.split("=");
			a = (this._isVowel(p[0][0])) ? "an " : "a ";
			v = 'with '+a+lnk+p[0]+' attribute</a> who\'s value is exactly '+p[1]+' ';
		} else{
			a = (this._isVowel(sel[0])) ? "an " : "a ";
			v = 'with '+a+lnk+sel+' attribute</a> ';
		}
		return v;
    },

    _getClassOrId: function( str0 ){
    	var classSel = 'a <a href="http://netart.rocks/notes/cssoverview#css-rules" target="_blank" style="color: #dad06f">class</a>';
		var idSel = 'an <a href="http://netart.rocks/notes/cssoverview#css-rules" target="_blank" style="color: #dad06f">id</a>';
		var tSel = (str0==".") ? classSel : idSel;
		return tSel;
    },

    _getElementCnt: function( arr, i ){

    	var str = arr[i];
    	var b4 = (arr[i-1]) ? arr[i-1] : false;
    	var af = (arr[i+1]) ? arr[i+1] : false;

    	var des = "";
    	var pse = "";	
    	var sib = "";
    	var attr = "";

    	// strip +/~
    	if( str[0]=="+" || str[0]=="~" ) str = str.substr(1,str.length);
		
		// if starts w/a space ( child / descendant )    	
    	if( str[0]==" " && b4 ){
    		if( b4==">" || b4==" >" ) des += 'which is a <a href="http://netart.rocks/notes/cssoverview#relative-selectors" target="_blank" style="color: #dad06f">child</a> of ';
    		else des += 'which is a <a href="http://netart.rocks/notes/cssoverview#relative-selectors" target="_blank" style="color: #dad06f">descendant</a> of ';
    		str = str.substr(1,str.length);
    	}

    	// if has a pseudo class
    	if( str.indexOf(":")>=0 && str.indexOf("::")<0 ){
    		var psC = str.substr(str.indexOf(":"),str.length);
    		if( psC.indexOf("(")>=0 ) psC = psC.substr(0,psC.indexOf("(")+1)+psC.substr(psC.indexOf(")"),str.length);
    		pse += '<a href="'+this.cssPseudoClasses[psC].url+'" target="_blank" style="color: #dad06f">'+
    			this[psC]+'</a> ';
    		str = str.substr(0,str.indexOf(":"));
    	}

    	// if followed by an element w/a +/~ sibling selector
    	if( af ){
    		if(af[0]=="+") 
				sib = 'which is an <a href="http://netart.rocks/notes/cssoverview#relative-selectors" target="_blank" style="color: #dad06f">adjacent sibling</a> of ';
			else if (af[0]=="~") 
				sib = 'which is a <a href="http://netart.rocks/notes/cssoverview#relative-selectors" target="_blank" style="color: #dad06f">general sibling</a> of ';
    	}

    	// if attribute selector
    	if( str.indexOf("[")>=0 ) {
    		attr += this._parseAttrSel(str);
    		str = str.substr(0,str.indexOf("["));
    	} else if( af && (af[0]=="." || af[0]=="#")){
    		var tSel = this._getClassOrId(af[0]);
    		var ci_name = af.substr(1,af.length); // class/id name w/out ./#
    		attr += 'with '+tSel+' attribute of <b>' + ci_name +" ";
    	}

    	
    	// PUT ALL THE PIECES TOGETHER -----------------------------------------------------
    	if( this.htmlElements[str] ){
    		var basic = 'any <span style="color:#F92672">'+str+"</span> element ";
    		var desStr = (pse.length>0&&des.length>0) ? "and "+des : des;
    		var attrStr = ((pse.length>0||des.length>0)&&attr.length>0) ? attr+"and " : attr;
    		return sib + basic + attrStr + pse + desStr;
    	
    	} else {
    		return false;
    	}
    },

	getExplanation: function( arr ){
		// Array [ "a", ".test", " >", " p", ".fart" ]


		// example arr ( Array )
		// .big.red 			>> [ ".big", ".red" ]
		// body > p 			>> [ "body", " >", " p" ]
		// .test a 				>> [ ".test", " a" ]
		// h1+h2 				>> [ "h1", "+h2" ]
		// h1~h2 				>> [ "h1", "~h2" ]
		// a+b.test > span 		>> [ "a", "+b", ".test", " >", " span" ]
		// p::first-letter 		>> [ "p::first-letter-letter" ]
		// a[target="_blank"]	>> [ "a[target="_blank"]" ]

		var relatives = [];
		var priorClass = false;
		var i;
		// find any relative selectors
		for ( i = 1; i < arr.length; i++) {
			if( arr[i]==" >" ) relatives.push('child');
			if( arr[i][0]=="." ) relatives.push('AND');
			if( arr[i][0]==" " && arr[i][1]!=">"  && arr[i-1]!==" >" ) relatives.push('descendant');
			if( arr[i][0]=="+" ) relatives.push('adjacent-sib');
			if( arr[i][0]=="~" ) relatives.push('general-sib');
		}
		
		// content = "read from right to left, this selector:<br><br>";

		content = "";

		// style selector header w/the right colors 
		for (i = 0; i < arr.length; i++) {
			z = arr[i].split(/(?=\+)|(?=\~)|(?=\:\:)|(?=\:)|(?=\~\=)|(?=\^\=)|(?=\*\=)|(?=\=)|(?=\[)|(?=\])/);
			for (var j = 0; j < z.length; j++) {
				if( typeof this.htmlElements[z[j].trim()]!=="undefined" ) 
					content += '<span style="color:#F92672">'+z[j]+'</span>';
				else if( z[j][0]=="."||z[j][0]=="#" ) 
					content += '<span style="color:#a6da27">'+z[j]+'</span>';
				else if( z[j][0]=="[" ) 
					content += '[<span style="color:#a6da27">'+z[j].slice(1,z[j].length)+'</span>';
				else if( z[j]=="~"||z[j]=="^"||z[j]=="*"||z[j]=="=" ) 
					content += '<span style="color:#F92672">'+z[j]+'</span>';
				else if( typeof this.htmlElements[z[j].slice(1,z[j].length).trim()]!=="undefined" && (z[j][0]=="+"||z[j][0]=="~") ) 
					content += z[j][0]+'<span style="color:#F92672">'+z[j].slice(1,z[j].length)+'</span>';
				else if( z[j].indexOf('="')===0 ) 
					content += '<span style="color:#F92672">'+z[j][0]+'</span><span style="color:#dad06f">'+z[j].slice(1,z[j].length)+'</span>';
				else 
					content += z[j];
			}
		}

		content += "<br><br>";
		content += "<i>read from right to left, this selector applies the declared rules to...</i><br><br> ";


		// construct the explination  
		for (i = arr.length-1; i >= 0; i--) {

			// spot pseudo elements
			if( arr[i].indexOf("::")>=0 ){
				var pe = arr[i].substr(arr[i].indexOf("::"),arr[i].length);				
				if( !this[pe] ) console.warn('CSSSelectorBreakdown: '+pe+' isn\'t in the pseudo-elements dictionary, wtf?');
				else {
					// TODO :::::::::::
					// content +=  '<a href="'+this.cssPseudoElements[pe].url+'" target="_blank" style="color: #dad06f">'+
					// this[pe]+'</a>';
					content += "[ WOOPS ERROR! sorry still working on pseudo elements, in the meantime checkout "+
					'<a href="'+this.cssPseudoElements[pe].url+'" target="_blank" style="color: #dad06f">'+pe+'</a> ] ';
				}
			}


			// spot class && id selector 
			if( arr[i][0]=="." || arr[i][0]=="#" ){				
				var tSel = this._getClassOrId(arr[i][0]);
				if( arr[i-1] ){
					var begin = (this._getElementCnt(arr,i-1)) ? this._getElementCnt(arr,i-1) : 
						"any element with "+tSel+' attribute of <b>' + arr[i].substr(1,arr[i].length);
					priorClass = begin + '</b> <a href="http://netart.rocks/notes/cssoverview#and-selectors" target="_blank" style="color: #dad06f">AND</a> ';
					
				} else {
					if( priorClass ) {
						content += priorClass;
						content += tSel+' attribute of <b>' + arr[i].substr(1,arr[i].length)+"</b> ";
						priorClass = null;
					} else {
						content += 'any element with '+tSel+' attribute of <b>' + arr[i].substr(1,arr[i].length)+"</b> ";
					}
					
				}
			}


			// spot type selectors
			if( this._getElementCnt(arr,i) ){
				if( priorClass ) {
					var andIdx = priorClass.indexOf('</b> <a href="http:');
					content += priorClass.substr(0,andIdx)+" ";
					priorClass = null;
				} else {
					content += this._getElementCnt(arr,i);
				} 
			}

		}

		return content; // for now

	 	// TODO :::::::::::::: better way to code mirror syntax highlight????
	 	// maybe using fancy https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes??? or other selector magix?

	}
};

/*

AND
Combinators ( only if ) > + ~
by attribute
	. # []

	...selector...

	read from right to left, this selector applies the subsequent declaration block ( the code between { and } ) to 
	-----
	any p element which are children of ( which means directly inside of ) any/the body element
	any/the body element 
	any span element which is a child of ( which means directly inside of ) any b element with the class attribute of "test" which is an adjacent sibling to any a element


	// pseudo element 
	'the area just before '     ::after
	'the area just after '  	::before
    'the first letter of '		::first-letter
    'the first line of '		::first-line
    'the highlighted part of '	::selection
    'the area below '			::backdrop
    'any placeholder text of '	::placeholder
    'the list bullet of '		::marker
    'a spelling error in '		::spelling-error
    'a grammer error in '		:::grammar-error


	'any ___ element'
	
	' that has been ___ ' // pseudo-class ( NOTE: add the word "and" if there's more to come after this )

	' that has a ______ attribute'
		'with a value of ______ '
		'that includes ______ in it\'s list of values'
		'with a value that starts with the string _____'
		'with a value that contains the string _____'
		'with a value that ends with the string _____'

	'which is a child of '
	'which is a descendant of '
	'which is an adjacent sibling of '
	'which is a general sibling of '



	' and will aslo apply to '
	


	( NOTE:::: hyperlink the following to netart.rocks notes? )
	relatives: " "(and) > + ~
	class selector
	id selector
	type selector
	attribute selectors
	pseudos ( to their urls )



*/