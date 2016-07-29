module.exports = (function(){
    'use strict';

	/**
	 * A module for validating parameters
	 * @class BB.ValidateParam
	 * @constructor
	 * 
	 * @param {Object} object should always be passed 'this',
	 * @param {Object} [chex] either an object or array of objects with info on what/how needs to be validated, some examples include:
	 *
	 * @example  
	 * <code class="code prettyprint">
	 * &nbsp;{ param: a, type:'number' } // is a tyepof 'number'<br>
	 * &nbsp;{ param: b, instanceof:Array } // is b an instanceof Array<br>
	 * &nbsp;{ param: c, value:["this","that","other"] }// is c one of the items in the array <br>
	 * &nbsp;{ param: d, min:5 } // is d at least 5<br>
	 * &nbsp;{ param: e, max:10 } // is e no more than 10<br>
	 * <br>
	 * &nbsp;// some more complicated examples include<br>
	 * &nbsp;{ param: f, min:5, max:10 } // is f a number between 5 and 10<br>
	 * &nbsp;{ param: g, type:['number','boolean'] } // is g either typeof 'number' or 'boolean'<br>
	 * &nbsp;{ param: h, instanceof:[HTMLCanvasElement,CanvasRenderingContext2D] }<br><br>
	 * &nbsp;// can also be passed 'name' property as a string (for more descriptive errors) <br>  
	 * &nbsp;{ param: i, name:"i", type:'number' }<br><br>
	 * &nbsp;// can also take an optional 'error' property for custom error messages <br>  
	 * &nbsp;{ param: j, type:'number', error:"the j parameter has to be a number" }<br><br>
	 * </code> 
	 * <br> 
	 * 
	 * one way this module can be used is
	 * <br>
	 * <code class="code prettyprint">  
	 * &nbsp;var err = new BB.ValidateParam( this, [<br>
	 * &nbsp;&nbsp;&nbsp;{ param: a, name: 'a', type:'number' },<br>
	 * &nbsp;&nbsp;&nbsp;{ param: b, instanceof:Array, error:"b's gotta be an Array" },<br>
	 * &nbsp;&nbsp;&nbsp;{ param: c, value:["this","that","other"] }<br>
	 * &nbsp;]);<br>
	 * </code>
	 * <br><br>
	 *
	 * another way this module can be used is
	 * <br>
	 * <code class="code prettyprint">  
	 * &nbsp;var err = new BB.ValidateParam( this );<br>
	 * &nbsp;err.checkType( a, 'string' );<br>
	 * &nbsp;err.checkInstanceOf( b, Array );<br>
	 * &nbsp;err.checkValue( c, ["this","that","other"] );<br>
	 * &nbsp;err.checkRange( f, 5, 10 );<br>
	 * <br>
	 * &nbsp;// these can also take an optional parameter for custom error messages<br>
	 * &nbsp;err.checkType( a, 'string', 'the a parameter has got to be a string' );<br>
	 * &nbsp;// alternatively, pass null to custom error, <br>
	 * &nbsp;// and pass just the param name for more custom auto-errors<br>
	 * &nbsp;err.checkType( x, 'string', null,'x' );<br>
	 * <br>
	 * </code>
	 * <br><br>
	 */
	function ValidateParam( object, chex ){

		if( !(typeof object !== "object" || typeof object !== "function")  ) throw new Error('ValidateParam: object param expecting typeof "object", you should pass "this"');

		this.errNtro = object.constructor.name + ": ";

		if( typeof chex !== "undefined" ){
			if( chex instanceof Array ){
				this.batchCheck( chex );
			} else if ( typeof chex === "object" ){
				this._checker( chex );
			} else {
				throw new Error('ValidateParam: chex param expecting either a param object or an Array of param objects'); 
			}
		}
	}

	ValidateParam.prototype._checker = function(obj) {
		if( typeof obj !== "object") throw new Error('ValidateParam: expecting an object like this: {param:<param>, type|instanceof|value|min&max:<check>}');

		if( typeof obj.param === "undefined" && obj.type !== 'undefined' && obj.type.indexOf('undefined')<0 ){
			throw new Error( this.errNtro+'param ['+obj.name+'] is undefined');
		}

		if( typeof obj.type==="undefined" &&
			typeof obj.instanceof==="undefined" &&
			typeof obj.value==="undefined" &&
			( typeof obj.min==="undefined" && typeof obj.max==="undefined" )) 
			throw new Error('ValidateParam: param objects requires either a "type" and/or "instanceof" and/or "value" and/or "min"/"max" property, to know what "param" should match');

		// check: typeof | instanceof | value | min&max

		if( typeof obj.type !== "undefined" ) 				this.checkType( obj.param, obj.type, obj.error, obj.name );
		else if ( typeof obj.instanceof !== "undefined" )	this.checkInstanceOf( obj.param, obj.instanceof, obj.error, obj.name );

		if( typeof obj.value !== "undefined" ) 				this.checkValue( obj.param, obj.value, obj.error, obj.name );
		
		if( typeof obj.min!=="undefined" || typeof obj.max!=="undefined" )
															this.checkRange( obj.param, obj.min, obj.max, obj.error, obj.name );		
	};

	/**
	 * takes an Array of param objects to batch check
	 * @method batchCheck
	 * @param {Array} chexArr an Array of param objects
	 * @example  
	 * <code class="code prettyprint">  
	 * &nbsp;ValidateParam = new BB.ValidateParam(this);<br>
	 * &nbsp;ValidateParam.batchCheck([<br>
	 * &nbsp;&nbsp;&nbsp;{ param: a, name: 'a', type:'number' },<br>
	 * &nbsp;&nbsp;&nbsp;{ param: b, instanceof:Array, error:"b's gotta be an Array" },<br>
	 * &nbsp;&nbsp;&nbsp;{ param: c, value:["this","that","other"] }<br>
	 * &nbsp;]);<br>
	 * </code>
	 */
	ValidateParam.prototype.batchCheck = function( chexArr ) {
		if( chexArr instanceof Array ){
			for (var i = 0; i < chexArr.length; i++) {
				this._checker( chexArr[i] );
			}
		} else {
			throw new Error('ValidateParam: chexArr param expecting an Array of param objects'); 
		}
	};

	/**
	 * checks that a parameter matches a certain type
	 * @method checkType
	 * @param {Object} p the parameter you want to check
	 * @param {String} t the type the parameter should be
	 * @param {String} [e] custom error message
	 * @example  
	 * <code class="code prettyprint">  
	 * &nbsp;ValidateParam = new BB.ValidateParam(this);<br>
	 * &nbsp;ValidateParam.checkType( a, 'string' );<br>
	 * &nbsp;// could also be an Array of types <br>
	 * &nbsp;ValidateParam.checkType( a, ['string','number'] );<br>
	 * &nbsp;// could also take a custom error message <br>
	 * &nbsp;ValidateParam.checkType( a, 'string', 'the a param should be a string' );<br>
	 * </code>
	 */
	ValidateParam.prototype.checkType = function( p, t, e, n ){
		var err;
		if( typeof n !== "undefined")
			err = e || n+" is typeof ["+typeof p+"], expecting typeof ["+t+"]";
		else
			err = e || "param value ["+p+"] is typeof ["+typeof p+"], expecting typeof ["+t+"]";
		err = this.errNtro + err;

		if( t instanceof Array ){
			for (var i = 0; i < t.length; i++) {
				if( typeof t[i] !== 'string') throw new Error('ValidateParam: "type" Array should contain list of strings');
				if( typeof p === t[i] ) break;
				// if check isn't any of types
				if( i == t.length-1 ) throw new Error( err );
			}
		} 
		else if ( typeof t === "string" ){
			// check type
			if( typeof p !== t ) throw new Error( err );
		}
		else {
			throw new Error('ValidateParam: "type" property should either be a String or an Array of Strings');
		}
	};

	/**
	 * checks that a parameter is an instanceof a particular object
	 * @method checkInstanceOf
	 * @param {Object} p the parameter you want to check
	 * @param {String} i the Object that p should be an instanceof 
	 * @param {String} [e] custom error message
	 * @example  
	 * <code class="code prettyprint">  
	 * &nbsp;var ValidateParam = new BB.ValidateParam(this);<br>
	 * &nbsp;ValidateParam.checkInstanceOf( a, Array );<br>
	 * &nbsp;// could also be an Array of types <br>
	 * &nbsp;ValidateParam.checkInstanceOf( a, [Array,String] );<br>
	 * &nbsp;// could also take a custom error message <br>
	 * &nbsp;ValidateParam.checkInstanceOf( a, Array, 'the a param has got to be an Array' );<br>
	 * &nbsp;// or alternatively... <br>
	 * &nbsp;ValidateParam.checkInstanceOf( a, Array, null, 'a' );<br>	 
	 * &nbsp;
	 * </code>
	 */
	ValidateParam.prototype.checkInstanceOf = function( p, i, e, n ){
		var funcName;
		if( i instanceof Array ){
			funcName = [];
			for (var c = 0; c < i.length; c++) {
				var name = i[c].toString();
				name = name.replace('function ',"");
				var pidx = name.search(/\(/);
				name = name.substr(0,pidx);
				funcName.push( name );
			}

		} else {
			funcName = i.toString();
			funcName = funcName.replace('function ',"");
			var parenIdx = funcName.search(/\(/);
			funcName = funcName.substr(0,parenIdx);
		}


		var err;
		if( typeof n !== "undefined")
			err = e || n+" is an instanceof ["+p.constructor.name+"], expecting instanceof ["+funcName+"]";
		else
			err = e || "param is an instanceof ["+p.constructor.name+"], expecting instanceof ["+funcName+"]";	
		err = this.errNtro + err;

		if( i instanceof Array ){
			for (var j = 0; j < i.length; j++) {
				if( typeof i[j] !== "function") throw new Error('ValidateParam: instanceof Array should contain list of function/class');
				if( p instanceof i[j] ) break;
				// if check isn't instanceof any of the specified functions/classes
				if( j == i.length-1 ) throw new Error( err );
			}
		} 
		else if ( typeof i === "function" ){
			// check if instanceof
			if(!(p instanceof i)) throw new Error( err );
		}
		else {
			throw new Error('ValidateParam: "instanceof" property should either be a function/class or an Array of function/class');
		}		
	};

	/**
	 * checks that a parameter matches a value from a list
	 * @method checkValue
	 * @param {Object} p the parameter you want to check
	 * @param {Array} v an Array of values to check p against
	 * @param {String} [e] custom error message
	 * @example  
	 * <code class="code prettyprint">  
	 * &nbsp;var ValidateParam = new BB.ValidateParam(this);<br>
	 * &nbsp;ValidateParam.checkValue( a, ["this","that","other"] );<br>
	 * &nbsp;// could also take a custom error message <br>
	 * &nbsp;ValidateParam.checkValue( a, ["this","that","other"], 'the a param should be one of the things' );<br>
	 * &nbsp;// or alternatively... <br>
	 * &nbsp;ValidateParam.checkValue( a, ["this","that","other"], null, 'a' );<br>	 	 
	 * </code>
	 */
	ValidateParam.prototype.checkValue = function( p, v, e, n ){
		var err;
		if( typeof n !== "undefined")
			err = e || n+" is ["+p+"], expecting one of these ["+v+"]";
		else
			err = e || "param value ["+p+"], expecting one of these ["+v+"]";
		err = this.errNtro + err;

		if( !(v instanceof Array) )
			throw new Error('ValidateParam: "value" property expects an Array of values to check against');

		if( v.indexOf(p) < 0 ) throw new Error(err);
	};

	/**
	 * checks that a parameter falls with in a certain range
	 * @method checkRange
	 * @param {Number} p the parameter you want to check
	 * @param {Number} mi the min value of the range 
	 * @param {Number} mi the max value of the range
	 * @param {String} [e] custom error message
	 * @example  
	 * <code class="code prettyprint">  
	 * &nbsp;var ValidateParam = new BB.ValidateParam(this);<br>
	 * &nbsp;ValidateParam.checkRange( a, 10, 20 );<br>
	 * &nbsp;// could also take a custom error message <br>
	 * &nbsp;ValidateParam.checkRange( a, 10, 20, "the a param has got to be between 10 && 20");<br>
	 * &nbsp;// or alternatively... <br>
	 * &nbsp;ValidateParam.checkRange( a, 10, 20, null, 'a' );<br>	 		 
	 * </code>
	 */
	ValidateParam.prototype.checkRange = function( p, mi, ma, e, n ){

		var min = (typeof parseFloat(mi)==="number") ? parseFloat(mi) : -Infinity;
		var max = (typeof parseFloat(ma)==="number") ? parseFloat(ma) : Infinity;

		var err, terr;
		if( typeof n !== "undefined"){
		 	terr = e || n+" is typeof ["+typeof p+"], expecting typeof [number]";
		 	err = e || n+" is value ["+p+"], expecting a value between ["+min+"] and ["+max+"]";
		} else {
			terr = e || "param value ["+p+"] is typeof ["+typeof p+"], expecting typeof [number]";
			err = e || "param value ["+p+"], expecting a value between ["+min+"] and ["+max+"]";
		}
		terr = this.errNtro + terr;
		err = this.errNtro + err;

		if( typeof p !== "number" ) throw new Error( terr );
		if( p < min || p > max ) throw new Error( err );
	};	

	return ValidateParam;

}());