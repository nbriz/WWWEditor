module.exports = function( self, mode, event ){

	var pos, wrd, len, num, type;

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

		return getWord;
	}

	function setUpVars(){
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
		if( before.indexOf("-")===before.length-1){
			num = -num;
			pos.anchor.ch--;
		}
		if( after.indexOf("%")===0){
			pos.head.ch++;
			type = "%";
		}
		len = pos.head.ch - pos.anchor.ch;
	}

	setUpVars();

	function canvasMove(e){
		if( e.buttons == 1 ){
			var diff = len - ( pos.head.ch-pos.anchor.ch );
			self.editor.setSelection( pos.anchor, {line:pos.head.line,ch:pos.head.ch+diff} );
			var val = e.clientX - event.clientX;
			var newVal = num + val;
			len = (newVal+type).length;
			self.editor.replaceSelection( newVal+type );
			self.cssNumSlider.update(e.clientX);
		}
	}

	var removeListener = function (event) {
		self.cssNumSlider.remove();
		window.removeEventListener('mouseup',removeListener, false );
	};	

	if( mode==="css" ){
		var el = document.getElementById(self.id);
		var fontSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
		var top = event.clientY + parseFloat(fontSize);
		var width = 275;
		var left = event.clientX - width/2;

		if( !self.cssNumSlider ){
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
					this.element.setAttribute('id','cssNumSliderWWWEditor');
					for( var key in this.css ) self.cssNumSlider.element.style[key] = this.css[key];
					this.canvas = document.createElement('canvas');
					this.canvas.width = width; this.canvas.height = parseFloat(fontSize)*2;
					this.ctx = this.canvas.getContext('2d');
					// this.ctx.font = fontSize+" inconsolata";
					// this.ctx.textAlign = "center";
					// this.ctx.textBaseline = "middle";
					// this.ctx.fillText('click and drag to change value',this.canvas.width/2,this.canvas.height/2);	
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
					setUpVars();
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
		}
		
		if( !isNaN(num) ){
			self.cssNumSlider.add(left,top);
		} else {
			self.cssNumSlider.remove();
		}
	
	} else {
		self.cssNumSlider.remove();
	}

};