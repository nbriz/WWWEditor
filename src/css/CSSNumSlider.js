module.exports = function( self, mode, event ){

	var mouseX = event.clientX;
	var pos, wrd, len, num, type;
	var float, fb, fa;

	function getWrd(side, position){
		var getPosition, getWord;
		if(side=="before"){
			getPosition = self.editor.findWordAt({line:position.anchor.line,ch:position.anchor.ch-1});
			getWord 	= self.editor.getRange( getPosition.anchor, getPosition.head );
		} else {
			getPosition = self.editor.findWordAt({line:position.anchor.line,ch:position.anchor.ch});
			getWord 	= self.editor.getRange( getPosition.anchor, getPosition.head );			
			getPosition = self.editor.findWordAt({line:position.anchor.line,ch:position.anchor.ch+getWord.length});
			getWord 	= self.editor.getRange( getPosition.anchor, getPosition.head );			
		}

		return { p:getPosition, w:getWord };
	}

	function setUpVars(select){
		pos = self.editor.findWordAt( self.editor.getCursor() );
		wrd = self.editor.getRange( pos.anchor, pos.head );
		num = parseFloat(wrd);

		if( wrd.indexOf('px')>=0) type = "px";
		else if( wrd.indexOf('pt')>=0) type = "pt";
		else if( wrd.indexOf('rem')>=0) type = "rem";
		else if( wrd.indexOf('em')>=0) type = "em";
		else type = "";

		var before = getWrd("before",pos);
		var after = getWrd("after",pos);

		// check for decimal
		if( wrd=="." ){
			float = true;
			pos.anchor.ch -= before.w.length;
			pos.head.ch += after.w.length;
		} else if(before.w=="."){
			fb = getWrd('before',before.p);
			pos.anchor.ch -= (before.w.length+fb.w.length);
			float = true;
		} else if(after.w=="."){
			fa = getWrd('after',after.p);
			pos.head.ch += (after.w.length+fa.w.length);
			float = true;
		} else { float = false; }

		before = getWrd("before",pos);
		after = getWrd("after",pos);
		wrd = self.editor.getRange( pos.anchor, pos.head );
		num = parseFloat(wrd);

		// check for negative value
		if( before.w.indexOf("-")===before.w.length-1){
			num = -num;
			pos.anchor.ch--;
		}

		// check for percent value
		if( after.w.indexOf("%")===0){
			pos.head.ch++;
			type = "%";
		}

		len = pos.head.ch - pos.anchor.ch;		

		if(select){
			var diff = len - ( pos.head.ch-pos.anchor.ch );
			self.editor.setSelection( pos.anchor, {line:pos.head.line,ch:pos.head.ch+diff} );
		}		
	}

	setUpVars();

	function canvasMove(e){
		if( e.buttons == 1 ){
			var diff = len - ( pos.head.ch-pos.anchor.ch );
			self.editor.setSelection( pos.anchor, {line:pos.head.line,ch:pos.head.ch+diff} );	

			var val;
			if( float )	val = e.clientX/100 - mouseX/100;
			else 		val = e.clientX - mouseX;							
			
			var newVal = Math.round( (num+val)*100 )/100;
			len = (newVal+type).length;
			self.editor.replaceSelection( newVal+type );
			self.cssNumSlider.update(e.clientX);
			self.editor.setSelection( pos.anchor, {line:pos.head.line,ch:pos.head.ch+diff} );
		}
	}

	var removeListener = function (event) {
		self.cssNumSlider.remove();
		self.editor.undoSelection();
		window.removeEventListener('mouseup',removeListener, false );
	};	

	if( mode==="css" ){
		var el = document.getElementById(self.id);
		var fontSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
		var top = event.clientY + parseFloat(fontSize);
		var width = 275;
		var left = mouseX - width/2;

		if( self.cssNumSlider ) self.cssNumSlider.remove();
		//if( !self.cssNumSlider ){
			self.cssNumSlider = { 
				element:null,
				inbody: false,
				leftStyle:"#75715e",
				rightStyle:"#75715e",
				css: {
					position: 'absolute',
					zIndex: 9999999, 
					top: top+"px",
					left: left+"px",
					border: "solid 1px rgb(117, 113, 94)",
					boxShadow: "-3px 3px 2px 0 rgba(0, 0, 0, 0.5)",
					webkitBoxShadow: "-3px 3px 2px 0 rgba(0, 0, 0, 0.5)",
					background: 'rgba(39,40,34,0.9)', // same as self.clr.dark, but transparent
					color: '#fff',
					width: width+'px',
					fontWeight: 300,
					cursor:'move'
				},				
				create: function(){
					var THISOBJ = this;					
					this.element = document.createElement('div');
					for( var key in this.css ) self.cssNumSlider.element.style[key] = this.css[key];
					this.canvas = document.createElement('canvas');
					this.canvas.width = width; this.canvas.height = parseFloat(fontSize)*2;
					this.ctx = this.canvas.getContext('2d');
					this.drawArrows();
					this.element.appendChild( this.canvas );	
					this.canvas.addEventListener('mousemove', canvasMove);
					this.canvas.addEventListener('mousedown', function(){
						window.addEventListener("mouseup", removeListener, false);
					});							
				},
				drawArrows: function(){	
					this.ctx.fillStyle = this.leftStyle;
					this.ctx.strokeStyle = this.leftStyle;	
					
					this.ctx.beginPath();
					this.ctx.moveTo( 10, this.canvas.height/2 );
					this.ctx.lineTo( 30, 10 );
					this.ctx.lineTo( 30, this.canvas.height-10 );
					this.ctx.closePath();
					this.ctx.fill();
				
					this.ctx.beginPath();
					this.ctx.moveTo( 15, this.canvas.height/2 );
					this.ctx.lineTo( this.canvas.width/2, this.canvas.height/2 );
					this.ctx.closePath();
					this.ctx.stroke();

					this.ctx.strokeStyle = this.rightStyle;
					this.ctx.fillStyle = this.rightStyle;

					this.ctx.beginPath();
					this.ctx.moveTo( this.canvas.width/2, this.canvas.height/2 );
					this.ctx.lineTo( this.canvas.width-15, this.canvas.height/2 );
					this.ctx.closePath();
					this.ctx.stroke();
					
					this.ctx.beginPath();
					this.ctx.moveTo( this.canvas.width-10, this.canvas.height/2 );
					this.ctx.lineTo( this.canvas.width-30, 10 );
					this.ctx.lineTo( this.canvas.width-30, this.canvas.height-10 );
					this.ctx.closePath();
					this.ctx.fill();

					this.ctx.strokeStyle = "#ae81f2";
					this.ctx.beginPath();
					this.ctx.moveTo( this.canvas.width/2, 0 );
					this.ctx.lineTo( this.canvas.width/2, this.canvas.height );
					this.ctx.closePath();
					this.ctx.stroke();
				},
				update: function( x ){
					this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
					if( x < left+width/2 ){
						this.leftStyle = "#ae81f2";
						this.rightStyle = "#75715e";
					} else if( x > left+width/2 ){
						this.leftStyle = "#75715e";
						this.rightStyle = "#ae81f2";
					} else {
						this.leftStyle = "#75715e";
						this.rightStyle = "#75715e";
					}
					this.drawArrows();
				},
				add: function(l,t){
					if( this.inbody ) this.remove();
					this.element.style.left = l+"px";
					this.element.style.top = t+"px";
					document.body.appendChild(this.element);
					this.update();
					setUpVars( true );
					this.inbody = true;
				},
				remove: function(){
					if( this.inbody ){
						document.body.removeChild(this.element);	
						this.inbody = false;
					} 				
				}				
			};
			self.cssNumSlider.create();
		//}
		
		if( !isNaN(num) ){
			self.cssNumSlider.add(left,top);
		} else {
			self.cssNumSlider.remove();
		}
	
	} else {
		if( self.cssNumSlider ) self.cssNumSlider.remove();
	}

};