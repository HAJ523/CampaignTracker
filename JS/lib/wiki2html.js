/*
  @author: remy sharp / http://remysharp.com
  @url: http://remysharp.com/2008/04/01/wiki-to-html-using-javascript/
  @license: Creative Commons License - ShareAlike http://creativecommons.org/licenses/by-sa/3.0/
  @version: 1.0

  Can extend String or be used stand alone - just change the flag at the top of the script.

  2018-03-20 HAJ523 Modifications made for Campaign tracker. Visit site above for original file.
  2018-03-23 HAJ523 Modifications to allow img display from local harddisk.
*/

(function () {

var extendString = false;

if (extendString) {
    String.prototype.wiki2html = wiki2html;
    String.prototype.iswiki = iswiki;
} else {
    window.wiki2html = wiki2html;
    window.iswiki = iswiki;
}

// utility function to check whether it's worth running through the wiki2html
function iswiki(s) {
    if (extendString) {
        s = this;
    }

    return !!(s.match(/^[\s{2} `#\*='{2}]/m));
}

// the regex beast...
function wiki2html(s) {
    if (extendString) {
        s = this;
    }

    // Inline sections need to be done as recursive calls.
    function section(str) {
      return str.replace(/{{([\s\S]*)}}/g, function(m,l) {
        var id = CT.tempID(8);
        //Get rid of outer layer of brackets
        //m = m.replace(/^{{/,"").replace(/}}$/,"");


        var contents = l.split(/\|/g);

        //Get the title and make sure that it is valued.
        var title = contents.shift();
        title = (title = "" ? id : title);

        //Perform the recursion over the section contents to handle nesting!
        l = section(contents.join("|"));
        return "<div class='w3-theme-d1 w3-padding-small' onclick='CT.toggleCollapsed(\"" + id + "\")'><span class='fa fa-plus' id='t-" +id+ "'>&nbsp;</span>" + title + "</div><div class='w3-container w3-hide w3-border' id='"+ id + "'>" + l + "</div>";
      });
    }


    // lists need to be done using a function to allow for recusive calls
    function list(str) {
        return str.replace(/(?:(?:(?:^|\n)[\*#].*)+)/g, function (m) {  // (?=[\*#])
            var type = m.match(/(^|\n)#/) ? 'OL' : 'UL';
            // strip first layer of list
            m = m.replace(/(^|\n)[\*#][ ]{0,1}/g, "$1");
            m = list(m);
            return '<' + type + '><li>' + m.replace(/^\n/, '').split(/\n/).join('</li><li>') + '</li></' + type + '>';
        });
    }

    return section(list(s

        /* BLOCK ELEMENTS */
        .replace(/(?:^|\n+)([^# =\*<].+)(?:\n+|$)/gm, function (m, l) {
            if (l.match(/^\^+$/)) return l;
            return "\n<p>" + l + "</p>\n";
        })

        .replace(/(?:^|\n)[ ]{2}(.*)+/g, function (m, l) { // Blockquotes
            if (l.match(/^\s+$/)) return m;
            return '<blockquote>' + l + '</blockqoute>';
        })

        .replace(/((?:^|\n)[ ]+.*)+/g, function (m) { // Code
            if (m.match(/^\s+$/)) return m;
            return '<pre>' + m.replace(/(^|\n)[ ]+/g, "$1") + '</pre>';
        })

        .replace(/(?:^|\n)([=]+)(.*)\1/g, function (m, l, t) { // Headings
            return '<h' + l.length + '>' + t + '</h' + l.length + '>';
        })

        /* INLINE ELEMENTS */
        .replace(/'''(.*?)'''/g, function (m, l) { // Bold
            return '<strong>' + l + '</strong>';
        })

        .replace(/''(.*?)''/g, function (m, l) { // Italic
            return '<em>' + l + '</em>';
        })

        .replace(/--(.*?)--/g, function(m, l) { //Strike Through
          return '<s>' + l + '</s>';
        })

        .replace(/[^\[](http[^\[\s]*)/g, function (m, l) { // Normal link
            return '<a href="' + l + '">' + l + '</a>';
        })

        .replace(/[\[](http.*)[!\]]/g, function (m, l) { // External link
            var p = l.replace(/[\[\]]/g, '').split(/ /);
            var link = p.shift();
            return '<a href="' + link + '" target="_blank">' + (p.length ? p.join(' ') : link) + '</a>';
        })

        .replace(/\[\[(.*?)\]\]/g, function (m, l) { // Internal link or Image
            var p = l.split(/\|/);
            var link = p.shift();

            if (link.match(/^Img:(.*)/)) {
              var q = link.split(/:/);
              var element = {name:(q.length > 2 ? q.splice(1).join(':') : q.pop())};
              return '<img class="journalImg" src="' + CT.loadIntImg(element) + '" onclick="CT.pictureDisplay(event);"/>'
            } else if (link.match(/^LocImg:(.*)/)) {
              var q = link.split(/:/);
              return '<img class="journalImg" src="' + (q.length > 2 ? q.splice(1).join(':') : data.settings.imagepath + q.pop()) + '" onclick="CT.pictureDisplay(event);"/>';
            } else if (link.match(/^Roll:(.*)/)) {
              var id = CT.tempID(8);
              var roll = link.split(/:/)[1];
              return '<a href="#" onclick="Roller.dice(\''+roll+'\',\'' + id + '\')" id="' + id + '" title="'+roll+'">'+roll+'</a>';
            } else if (link.match(/^Sect:(.*)/)) {
              var id = CT.tempID(8);
              var q = link.split(/:/);
              var pg = (q.length > 2 ? q.splice(1).join(':') : q.pop());
              return "<div class='w3-theme-d1 w3-padding-small' onclick='CT.toggleCollapsed(\"" + id + "\")'><span class='fa fa-plus' id='t-" +id+ "'>&nbsp;</span>" + (p.length ? p.join('|') : link.split(/\//).pop()) + "</div><div class='w3-container w3-hide w3-border' id='"+ id + "'>" + (data.pages.hasOwnProperty(pg) ? wiki2html(data.pages[pg].content) : "No page with that name.") + "</div>";
            } else {
              return '<a href="#" onclick="CT.loadPage(\'' + link + '\');">' + (p.length ? p.join('|') : link.split(/\//).pop()) + '</a>';
            }
        })
    ));
}

})();
