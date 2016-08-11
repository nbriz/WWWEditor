module.exports = function( word, preChar ){

    var elementsDict = require('./html-elements-dictionary');
    var attributesDict = require('./html-attributes-dictionary');
    var status, nfo, url, els, content;

    if( elementsDict.hasOwnProperty( word ) && (preChar=="<"||preChar=="</")  ){

        status = elementsDict[word].status;
        nfo = elementsDict[word].nfo;
        url = elementsDict[word].url;

        nfo = nfo.replace(/</g,"&lt;");
        nfo = nfo.replace(/>/g,"&gt;");

        content = '<a href="'+url+'" target="_blank" style="color:#F92672">'+word+'</a> ';
        if( status.length>0 ) content += '| ['+status+']';
        content += "<br><br>";
        content += nfo+' <a style="color:#dad06f;font-style:italic" href="'+url+'" target="_blank">(learn more)</a>';
        content += "<br><br>";
        // content += '<div style="margin:10px;border-bottom:1px solid #dad06f"></div>';
        content += '<a href="http://netart.rocks" target="_blank" style="color:#dad06f">http://netart.rocks</a>';

        // TODO:
        // - related videos list
        // - code snippets

        return content;

    } else if( attributesDict.hasOwnProperty( word ) ){

        status = attributesDict[word].supported;
        nfo = attributesDict[word].nfo.w3c;
        els = attributesDict[word].elements.toString();
        els = els.replace(/</g,"&lt;");
        els = els.replace(/>/g,"&gt;");

        content = '<span style="color:#a6da27">'+word+'</span> ';
        if( !status ) content += '| [ depreciated ]';
        content += "<br><br>";
        content += nfo;
        if( els == "Global attribute" )
            content += " this is a <b>Global Attribute</b> and can be applied to any element.";
        else
            content += 'this can only be applied to: <span style="color:#F92672">'+els+"</span>";
        // content += '<div style="margin:10px;border-bottom:1px solid #dad06f"></div>';
        content += ' <a style="color:#dad06f;font-style:italic" href="http://www.w3schools.com/tags/att_'+word+'.asp" target="_blank">(learn more)</a><br><br>';
        content += '<a href="http://netart.rocks" target="_blank" style="color:#dad06f">http://netart.rocks</a>';

        return content;


    } else {
        return false;
    }

};    