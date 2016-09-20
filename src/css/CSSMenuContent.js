module.exports = function( word, postChar ){

    var cssProperties = require('./css-properties-dictionary');
    var status, nfo, url, els, content;

    word = word.toLowerCase();

    if( cssProperties.hasOwnProperty( word ) && postChar===":" ){
        
        url = cssProperties[word].url;
        nfo = cssProperties[word].nfo;
        nfo = nfo.replace(/</g,"&lt;");
        nfo = nfo.replace(/>/g,"&gt;");

        content = '<a href="'+url+'" target="_blank" style="color:#64d6eb">'+word+'</a> ';
        content += "<br><br>";
        content += nfo+' <a style="color:#dad06f;font-style:italic" href="'+url+'" target="_blank">(learn more)</a>';
        content += "<br><br>";
        content += '<a href="http://netart.rocks" target="_blank" style="color:#dad06f">http://netart.rocks</a>';

        return content;       

    } else {
        return false;
    }
};    