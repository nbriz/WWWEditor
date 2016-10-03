# WWWEDITOR
### a wwweb based realtime code editor, with friendly errors && helpers

----------

![WWWEditor in action](/notes/screenshot.png)

##getting started

include the WWWEditor CSS file ( this project is built on top of [CodeMirror](http://codemirror.net/), this CSS file is a combination of three other CSS files the WWWEditor is dependent on ):

    <link rel="stylesheet" href="wwweditor.css">

include the WWWEditor library in ur html page:

    <script src="wwweditor.min.js"></script>

create an element on ur page for the editor to go in:

    <div id="editor"></div>

then create an instanceof the WWWEditor

	var edtr = new WWWEditor({
		id: "editor"
	});

###config object

**id:** *[string]* the id value of the element u want to stick the WWWEditor in. this is the only required config parameter, but there's lots of additional optional parameters u can pass to the config object

**type:** *[string]* the kind of code in the editor ( "html", "css", "js" ) *default: "html"*

**file:** *[string]* a path to a file u want to open in the editor on load

**libs:** *[Array]* specifically for when the editor type is javascript. an array of paths ( strings ) to any  third party libraries

**preview:** *[string]* the id of the element u'd like to stick the output of the editor into

**autoUpdate:** *[boolean]* if u have a preview element set, then any changes made in the editor automatically update in the preview, u can switch this off ( && manually handle updates ) *default:true*

**updateDelay:** *[number]* if autoUpdate is true, the time it takes ( in milliseconds ) for the preview to update after a change is made in the editor *default:500*

**friendlyErrors:** *[boolean]* when type is html/css friendlyErrors will display html/css errors ( otherwise html/css has no errors, like in real life ) when type is javascript the default js errors are replaced with more beginner-friendly language *default:false*

**supressRefErr:** *[boolean]* reference errors in javascript ( if there's a variable being used that hasn't been declared for example ) can be turned off if u'd like ( leaving only syntax errors ) *default:false*

**cssWidgets:** *[boolean]* when type is html/css helper-widgets will pop up when u click on a CSS color value or number value *default:true*

**uitTip:** *[boolean]* when set to true, small tips ( pertaining to how WWWEditor worx ) will appear at the bottom of the editor when applicable *default:false*

**modalCSS:** *[object]* when u click the WWWEditor's gutter widgets an info modal will open ( sometimes these are reference modals, other times they are error messages ). the modal's default CSS can be overridden by passing a CSS object where the property is a DOM style property ( color, fontFamily, etc. ) && the value is a CSS value string ( "#ff0000", "san-serif", etc. )

here's an example of a more complicated instanceof WWWEditor:

	
	var edtr = new WWWEditor({
		id: "editor",
		preview: "preview",
		type: "js",
		friendlyErrors: true,
		file:'samples/basic.js',
		libs:['js/p5.min.js'],
		autoUpdate: false
	});

##API

###url parameters

if no **file** config property is set, the WWWEditor looks to see if there's a file url parameter. for example, if ur page is *http://nickbriz.com/cool-editor/index.html* then u can autoload a file into the WWWEditor instance by doing something like: *http://nickbriz.com/cool-editor/index.html?file=samples/basic.js* 

###public methods

`.update()` when the **autoUpdate** config parameter is set to false, the WWWEditor's update method can be called manually to update the preview

`.load( path )` this will replace the current code in the editor with the content of the file u pass ( as a string ) as the argument

`.addPanel( message, placement )` u can insert helpful tips/messages ( the same kind that  automatically appear when **uiTip** is set to true ) by calling the addPanel method which takes at least one argument ( *message* the string u want to appear in the tip panel ) as well as an optional *placement* argument ( either "top" or "bottom", default is "bottom" )





## dev notes
run `npm install` in the root directory to download the dependencies 

to build the library u can run `npm run build`, which will lint + create 2 files, the wwweditor.min.js && the wwweditor.css. best thing to do while developing is run the watch script: `npm run watch`
that will run lint/build as u save ur changes. 


### dev dependencies

**browserify:** for compiling the build<br>
**jshint:** for linting<br>
**jshint-stylish:** for prettier linting <br>
**nodemon:** for watching <br>
**uglify-js:** for minifying <br>

### lib dependencies

**[CodeMirror](http://codemirror.net/):** amazing project upon which this WWWEditor is built!<br>
**[esprima](http://esprima.org/):** made by the jQuery folks, used for some of the javascript parsing<br>
**[CSSLint](http://csslint.net/):** very solid CSS linter, used for some of the css linting<br>
**[html-friendly-linter](https://github.com/nbriz/html-friendly-linter):** a kludgey linter i made for the html<br>
<br>
**additional code-thnx to**
**[John Resig](http://ejohn.org/):** where i got some HTML-Parsing inspiration from ( && whose regex magix i copy+pasted )<br>
**[Mozilla's Developer Network](https://developer.mozilla.org/en-US/docs/Web/HTML)** && **[W3CSchools](http://www.w3schools.com/):** who's html/css refernce nfo i scrapped && link bax to <br>
&& all the snippets i copied pasted from stack-overflow ( links to these accompany each snippet in the src code ) <br>


## thnx for the ideas
first && formost, my hypertext heros [Ted Nelson](http://ted.hyperland.com/) && [Tim Berners-Lee](https://www.w3.org/People/Berners-Lee/) ( b/c obvious reasons ) [Jon Duckett](http://www.htmlandcssbook.com/) ( for the friendly style inspiration ), Jon Skinner ( for making the best code-editor [ [sublime](http://www.sublimetext.com/) ] from which i took lots of inspiration ), [Alan Kay](https://en.wikipedia.org/wiki/Alan_Kay) && [Adele Goldberg](https://en.wikipedia.org/wiki/Adele_Goldberg_%28computer_scientist%29) ( who's work in general [Smalltalk specifically] serves as the philosophical foundation for this whole thing ), [Bret Victor](http://worrydream.com/LearnableProgramming/) ( for reminding us that Kay/Goldberg's legacy needed to be carried on && built on ) && [Patricio Gonzalez Vivo](http://www.patriciogonzalezvivo.com/about.php) ( whose [GLSLShaderEditor](https://github.com/patriciogonzalezvivo/glslEditor) proved to me that Bret Victors ideas could actually be xecuted )









