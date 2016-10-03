module.exports = function( self, event ){

	var pos = self.editor.findWordAt( self.editor.getCursor() );
	var wrd = self.editor.getRange( pos.anchor, pos.head );
	var posB4 = self.editor.findWordAt({line:pos.anchor.line,ch:pos.anchor.ch-1});
	var wrdB4 = self.editor.getRange( posB4.anchor, posB4.head );

	// via: http://stackoverflow.com/a/8027444/1104148
 	var isHexClr  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(wrdB4[wrdB4.length-1]+wrd);


 	var mouseup1, mousedown1, mousemove1, updateColor, rmvColorPicker;
 	var mouseup2, mousedown2, mousemove2, updateCanvClr;
 	var componentToHex, rgbToHex;

 	if( isHexClr ){

		if(wrd.length==3){
			self.editor.setSelection({line:pos.anchor.line,ch:pos.anchor.ch-1},pos.head);
			self.editor.replaceSelection("#"+wrd[0]+wrd[0]+wrd[1]+wrd[1]+wrd[2]+wrd[2]);
			var cursor = self.editor.getCursor();
	 		pos = self.editor.findWordAt({ line:cursor.line, ch:cursor.ch-3 });
	 		wrd = self.editor.getRange( pos.anchor, pos.head );			
		} 		

		var x = 0;
		var y = 0;
		var drag1 = false;
		var drag2 = false;
		var rgbaColor = 'rgba(255,0,0,1)';
		var mouseX = event.clientX;
		var el = document.getElementById(self.id);
		var fontSize = window.getComputedStyle(el, null).getPropertyValue('font-size');
		var top = event.clientY + parseFloat(fontSize);
		var width = (10+200+10) + (50+10);
		var left = mouseX - width/2;

		// via: http://stackoverflow.com/a/5624139/1104148
	 	componentToHex = function(c) { var hex = c.toString(16); return hex.length == 1 ? "0" + hex : hex; };
		rgbToHex = function(r, g, b) { return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);};
		//
		mousedown1 = function(e) { drag1 = true; updateColor(e); };
		mousemove1 = function(e) { if (drag1) updateColor(e); };
		mouseup1 = function(e) { drag1 = false; rmvColorPicker(); };
		rmvColorPicker = function(){ self.CSSColorPicker.remove(); self.update(); };
		updateColor = function(e) {
			self.editor.setSelection({line:pos.anchor.line,ch:pos.anchor.ch-1},pos.head);
			x = e.offsetX;
			y = e.offsetY;
			var imageData = self.CSSColorPicker.ctx1.getImageData(x, y, 1, 1).data;
			var newVal = rgbToHex( imageData[0], imageData[1], imageData[2] );
			self.editor.replaceSelection( newVal );
		};
		//
		mousedown2 = function(e) { drag2 = true; updateCanvClr(e); };
		mousemove2 = function(e) { if (drag2) updateCanvClr(e); };
		mouseup2 = function() { drag2 = false; };
		updateCanvClr = function(e) {
			x = e.offsetX;
			y = e.offsetY;
			var imageData = self.CSSColorPicker.ctx2.getImageData(x, y, 1, 1).data;
			rgbaColor = 'rgba(' + imageData[0] + ',' + imageData[1] + ',' + imageData[2] + ',1)';
			self.CSSColorPicker.updateCanv2();
		};


		self.editor.setSelection({line:pos.anchor.line,ch:pos.anchor.ch-1},pos.head);


		if( self.CSSColorPicker ) self.CSSColorPicker.remove();

		self.CSSColorPicker = {
			element:null,
			inbody: false,
			css: {
				position: 'absolute',
				zIndex: 9999999,
				top: top + "px",
				// left: left + "px",
				left: "50px",
				border: "solid 1px rgb(117, 113, 94)",
				boxShadow: "-3px 3px 2px 0 rgba(0, 0, 0, 0.5)",
				webkitBoxShadow: "-3px 3px 2px 0 rgba(0, 0, 0, 0.5)",
				background: 'rgba(39,40,34,0.9)', // same as self.clr.dark, but transparent
				color: '#fff',
				buffer:10,
				width: width + this.buffer+ 'px',
				fontWeight: 300,
				cursor: 'crosshair'
			},
			create: function() {
				var THISOBJ = this;
				this.element = document.createElement('div');
				for (var key in this.css) self.CSSColorPicker.element.style[key] = this.css[key];
				this.initCanvas1();
				this.initCanvas2();				
				this.canv1.addEventListener("mousedown", mousedown1, false);
				this.canv1.addEventListener("mouseup", mouseup1, false);
				this.canv1.addEventListener("mousemove", mousemove1, false);	
				this.canv2.addEventListener("mousedown", mousedown2, false);
				this.canv2.addEventListener("mouseup", mouseup2, false);
				this.canv2.addEventListener("mousemove", mousemove2, false);			
			},
			initCanvas1: function(){
				this.canv1 = document.createElement('canvas');
				this.canv1.style.margin = "10px";
				this.canv1.width = 200;
				this.canv1.height = 200;
				this.ctx1 = this.canv1.getContext('2d');
				this.element.appendChild(this.canv1);
			},
			initCanvas2: function(){
				this.canv2 = document.createElement('canvas');
				this.canv2.style.margin = "10px 10px 10px 0px";
				this.canv2.width = 50;
				this.canv2.height = 200;
				this.ctx2 = this.canv2.getContext('2d');
				this.element.appendChild(this.canv2);
				//
				this.ctx2.rect(0, 0, this.canv2.width, this.canv2.height);
				var grd1 = this.ctx2.createLinearGradient(0, 0, 0, this.canv2.height);
				grd1.addColorStop(0, 'rgba(255, 0, 0, 1)');
				grd1.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
				grd1.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
				grd1.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
				grd1.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
				grd1.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
				grd1.addColorStop(1, 'rgba(255, 0, 0, 1)');
				this.ctx2.fillStyle = grd1;
				this.ctx2.fill();		
				//
				this.updateCanv2();			
			},
			updateCanv2: function(){
				// >> via: http://codepen.io/amwill/pen/ZbdGeW
				this.ctx1.fillStyle = rgbaColor;
				this.ctx1.fillRect(0, 0, this.canv1.width, this.canv1.height);
				var grdWhite = this.ctx2.createLinearGradient(0, 0, this.canv1.width, 0);
				grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
				grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
				this.ctx1.fillStyle = grdWhite;
				this.ctx1.fillRect(0, 0, this.canv1.width, this.canv1.height);
				var grdBlack = this.ctx2.createLinearGradient(0, 0, 0, this.canv1.height);
				grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
				grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
				this.ctx1.fillStyle = grdBlack;
				this.ctx1.fillRect(0, 0, this.canv1.width, this.canv1.height);
			},
			add: function(l, t) {
				if (this.inbody) this.remove();
				// console.log(width,document.body.offsetWidth-10);
				// if(l+width>=document.body.offsetWidth-10) l = 50;
				this.element.style.left = l + "px";
				this.element.style.top = t + "px";
				document.body.appendChild(this.element);
				this.inbody = true;
			},
			remove: function() {
				if (this.inbody) {
					document.body.removeChild(this.element);
					this.inbody = false;
				}
			}
		};
			
		self.CSSColorPicker.create();
		self.CSSColorPicker.add(left,top);

		return true;
	}
	else {
		if(self.CSSColorPicker) self.CSSColorPicker.remove();	
		return false;	
	}
};