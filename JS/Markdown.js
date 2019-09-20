/*
  Limited Markdown translation to HTML for display

  Author: HAJ523
  2019-01 Created.
*/

var MD = {}; //Initialize markdown object.

/*
  Scope: Public
  Parameters:
    s = string of markdown text to be transformed into html
    heads = Headers to be aggregated for contents.
    r = Run Javascript if any found.
  Returns:
    HTML
*/
MD.toHTML = function(s, heads, r) {
  var i = -1;
  return s.split('```').map(function (s) {
    i++;
    if (i%2) { //Make sure that HTML is properly escaped for later copying.
      //If the first line contains the JS/Javascript assume that this should be executed instead of displayed
      var a = s.split('\n');
      var t = a.shift();
      s = a.join('\n');
      t = t.trim().toUpperCase();
      if (/(?:JS|JAVASCRIPT)/g.test(t)) {

        //Now only attempt running if we should always run or we are set to run!
        if (/RUN/g.test(t)) {
          try {
            eval(s);
          } catch (e) {
            CT.setStatus(e.name + " - " + e.message,"See javascript console for problematic code.","stat-fail","Custom Code Error");
            console.log("Problematic Code:\n"+s);
          }
        }

        return '';
      }
      return '<pre onclick="CT.copy(this.children[0]);"><code>' + CT.escapeHtml(s.replace(/^[\n]+|[\n]+$/g,"")) + '</code></pre>';
    } else {
      return s.replace(/^[\n]+|[\n]+$/g,"") //Trim extra spaces!
      //Get & Set Page variables
      //Paragraph
      .replace(/(?:(?:^|\n)+((?:[^#\|\n>\-*+ ](?:.*)(?:\n|$))+))/g, function (m, a) {//Parameters Match, Paragraph   Returns: <p>Paragraph</p>
        return '\n<p>' + a.replace(/\n/g,"<br>") + '</p>\n';
      })
      //Inline Code
      .replace(/\`(.*?)\`/g, function (m, a) {
        return '<code onclick="CT.copy(this);">' + a + '</code>';
      })
      //Strong
      .replace(/\*\*(.*?)\*\*/g, function (m, a) { //Parameters: Match, Text   Return: <strong>Text</strong>
          return '<strong>' + a + '</strong>';
      })
      //Em
      .replace(/\*(.*?)\*/g, function (m, a) { //Parameters: Match, Text   Return: <em>Text</em>
          return '<em>' + a + '</em>';
      })
      //Underline
      .replace(/__(.*?)__/g, function(m, a) { //Parameters: Match, Text   Return <u>Text></u>
        return '<u>' + a + '</u>';
      })
      //Block Qoute
      .replace(/(?:(?:^|\n)+((?:(?:>[ ]?){1}(?:.*)(:?\n|$))+))/g, function(m, a) {//Parameters: Match, "> Text"   Return: <blockqoute>Text</blockqoute>
        return "\n<blockquote class=\"w3-panel w3-leftbar w3-theme-l5\"><p>" + a.replace(/(?:>[ ]?)(.*)/g,"$1").replace(/\n[\s]*\n/g,"</p><p>").replace(/\n$/,"").replace(/\n/gm,"<br/>\n") + "</p></blockquote>\n";
      })
      //Headers
      .replace(/(?:^|\n)([#]+)[\t ]*(.*)/g, function(m, a, b) { //Parameters: Match, #.*, Header   Return: <h#>text</h#>
        var guid = CT.GUID(8);
        if (Array.isArray(heads)) { heads.push({"id": guid, "name":b, "length": a.length}); }
        return '\n<h' + a.length + ' id="H_' + guid + '">' + b + '</h' + a.length + '>';
      })
      //Horizontal Seperator
      .replace(/(?:^|\n)[\t ]*[\-\*\_]{3}[\t ]*(?:$|\n)/g, function(m, a) {//Parameters: Match, Horizontal Seperator   Return: <hr></hr>
        return "\n<hr></hr>\n";
      })
      //Strikethrough
      .replace(/~~(.*?)~~/g, function(m, a) { //Parameters Match, Text   Return: <del>Text</del>
        return '<del>' + a + '</del>';
      })
      //Images     Needs to come before links to be able to differentiate.
      .replace(/\!\[(.*?)\](?:\((\".*\"|[^ \n]*)[ ]?(.*)?\))?/g, function(m, a, b, c) {
        b = ((b == null) ? a : b); //TODO if b not provided then make a = campaign prefix + a;
        c = ((c == null) ? a : c);
        return '<img src="' + b + '" title="' + c + '" onclick="CT.imageShow(this);">';
      })
      //Dice Roller
      .replace(/\?\[(.*?)\](?:\(([^\)]*)\))?/g, function(m, a, h) { //Parameters: Match, Roll, header   Return: <a href='roll'>Roll</a>
        return '<a href="javascript:RL.roll(\'' + a + '\',\'' + h + '\')" title="' + ((h==undefined) ? a : h) + '">' + a + '</a>';
      })
      //Calculator
      .replace(/&\[(.*?)\]/g, function(m, a) { //Parameters: Match, Equation   Return: <a href'calc'>Equation</a>
        var id = CT.GUID(8);
        return '<a href="javascript:RL.calc(\''+id+'\')" title="' + a + '" id="' + id + '">' +eval(a)+ '</a>';
      })
      //Playlist
      .replace(/\$\[(.*?)\](r)?(?:\((.*?)\))?/g,function(m, a, r, t) {//Match, List, Title
        t = ((t==undefined)? "Playlist":t);
        r = ((r==undefined)? undefined:'\'r\'');
        return '<a href="javascript:AU.newPlaylist(\'' + a + '\',' + r + ');">' + t + '</a>';
      })
      //Effects
      .replace(/\%\[(.*?)\](?:\((.*?)\))?/g,function(m, a, t) {//Match, List, Title
        t = ((t==undefined)? "Effects":t);
        return '<a href="javascript:AU.newEffects(\'' + a + '\')">' + t + '</a>';
      })
      //Tabs (Uses alternative header syntax, Number of = determines sixe of tab select)
      .replace(/([^\n]+)\n(=+)\n(.*)(?:\n(?:=+)[^\n]*|\Z)/gm,(m,t,s,c)=>{ //Match, Title, Size, Content
        //TODO Create tab to html code.
      })
      //Sections TODO
      .replace(/\@\[(.*?)\]/g, function(m, a) {//Parameters: Match, Page
        return a;
      })

      //Links
      .replace(/\[(.*?)\/?([^\/]*?)\](?:\((\".*\"|[^ \n]*)[ ]?(.*)?\))?/g, function(m, a, b, c, d) { //Parameters: Match, Parent Folder, Page, Link, Title  Returns: <a href=Link title=Title>Page</a>
        a = ((a != "") ? [a, b].join("/") : b); //If there was a parent page then make sure that that is included in the link if Link is not populated.
        d = ((d == undefined)? a : d);
        if ((c == null) || (c == undefined) || (c == "")) {
          var l = a.split(":");
          c = "javascript:"
          if (l.length > 1) {
            c += 'CT.changeView(\''+l[0]+'\');';
            a = l[1];
          }
          c += 'CT.selectPage(\'' + a + '\');';
        }

        //TODO Lookup page data for first non-header line and use that as title if none provided.
        return '<a href="' + c + '" title="' + d + '">' + b + '</a>';
      })
      //Tables
      .replace(/((?:^|\n)\|.*?\n)(\|.*?\n)((?:\|.*?(?:\n|$))*)/gs, function(m, a, b, c) {//Parameters: Match, Headers, Alignment, Data   Returns: <table>...</table>
        return MD.tableToHTML(a,b,c);
      })
      //Lists (Must remain at the bottom to avoid parsing mistakes with other elements!)
      .replace(/((?:^|\n)(?:[*+-]){1}(?:.*)(?:(?:^|\n)(?:[* +-][ ]?){1}(?:.*))*)/g, function (m, a) { //Parameters: Match, List   Returns: <ol/ul>...</...>
        return MD.listsToHTML(a);
      });
    }
  }).map(function(t) {
    if (!Array.isArray(heads)) {return t;}
    if (heads.length == 0) {return t;}
    return MD.headerDiv(heads) + t;
  }).join('');
}

/*
  Scope: Private
  Description: Aggregates the headers and the IDs into a displayable floating div!
*/
MD.headerDiv = function(heads) {
  var s = '<div class="journalContents w3-tiny w3-padding-small w3-no-select"><div onclick="JL.toggleContents(this);">+ <strong>Contents</strong> +</div><div id="journalNav" class="w3-left-align w3-hide">';
  //Loop over all of the headers
  for (var i = 0; i < heads.length; i++) {
    s += '\u00A0\u00A0'.repeat(heads[i].length) + '<a href="javascript:JL.scrollTo(\'' + heads[i].id + '\');">' + heads[i].name + '</a><br/>';
  }
  heads.length = 0;
  return s + "</div></div>";
}

/*
  Scope: Private
  Parameters:
    s = string of markdown text to be transformed into html
  Returns:
    HTML of nested lists.
*/
MD.listsToHTML = function(s) {
  //Operate over all of the lines in order from this group.
  var sa = s.split(/\n/g);
  var pt = [];
  var ct = -1;
  var cl = -1;
  var ret = "";

  //Loop over all of the lines.
  for (var i = 0; i < sa.length; i++) {
    //In case we get an empty line ignore it!
    if (sa[i] == "") { continue; }

    //Determine list type.
    ct = ((sa[i].search(/^[ ]*[^*\-+ ]+.*$/g)>-1) ? 2 : ((sa[i].search(/^[ ]*[+]/g)>-1) ? 0 : 1 ))
    cl = sa[i].search(/[*\-+]/);
    if (cl < 0) {
      var temp = sa[i].search(/\S/);
      cl = ((temp < 0) ? 0 : temp-1);
    }

    //If the previous level is greater than the current level.
    while ((pt.length - 1) > cl) {
      ret += ((pt.pop()) ? "</ul>":"</ol>");
    }

    //If the next level is above then add to the list stack.
    while(pt.length-1 < cl) {
      pt.push(ct);
      ret += ((ct) ? "<ul>" : "<ol>");
    }

    //If the current list types do not match then start a new list at the current level.
    if ((pt[pt.length-1] != ct) && (ct != 2)) {
      ret += ((pt.pop()) ? "</ul>":"</ol>")
      pt.push(ct);
      ret += ((ct) ? "<ul>" : "<ol>")
    }

    if (ct == 2) {
      ret = ret.slice(0,ret.length-5) + "<p>" + sa[i].replace(/^[ ]*(.*)/g,"$1") + "</p></li>";
    } else {
      ret += "<li>" + sa[i].replace(/^[ ]*[*\-+][ ]?(.*)/g,"$1") + "</li>";
    }
  }

  //Make sure that we close the last list
  while(pt.length > 0) {
    ret += ((pt.pop()) ? "</ul>":"</ol>");
  }

  return ret;
}

/*
  Scope: Private
  Parameters:
    a = Header Line
    b = Alignment line
    c = remaining data lines.
  Returns:
    HTML of tables.
*/
MD.tableToHTML = function(a, b, c) {
  var ret = '<div class="w3-display-container w3-margin-small"><table class="w3-table w3-bordered w3-striped"><thead><tr class="w3-theme">';
  var aln = [];

  //Get the default id for saving
  var tableID = "";
  a = a.replace(/\((\w*)\)?/g, function(m, a) { tableID = a.trim(); return "";});
  tableID = ((tableID==undefined)? "" : tableID);

  //Alignment
  b.replace(/\|([^|\n]*)(?:\|\n)?/g, function(m, a) {
    aln.push((a.search(/^-+:/g) >= 0) ? ' style="text-align:right;"' : ((a.search(/^:-+:/g) >= 0) ? ' style="text-align:center;"' : "")); //Right, Center, Left (Default)
    return ""; //Return doesn't mean anything in this case.
  });

  //Headers
  var num = -1;
  ret += a.replace(/\|([^|\n]*)(?:\|\n)?/g, function(m, a) { //Parameters: Match, Column, table ID
    num++;
    return '<th' + (((aln[num]!="") && (aln[num] != undefined)) ? aln[num] : "") + ' onclick="JL.sortTable(this);" >'+ a.trim() + '</th>';
  }) + '</tr></thead>';

  //Data
  var dAry = c.split(/\n/g);
  for (var i = 0; i < dAry.length; i++ ) {
    num =- 1;

    if (dAry[i]=="") {break;}
    if (dAry[i].replace(/\|/g,"") == "") {break;}
    ret += '<tr>' + dAry[i].replace(/\|([^|\n]*)(?:\|\n)?/g, function(m, a) { //Parameters: Match, Column
      num++;
      if (a=="") {return "";}
      return '<td' + (((aln[num]!="") && (aln[num] != undefined)) ? aln[num] : "") + '>' + a + '</td>';
    }) + '</tr>';
  }

  return ret + '</table>'+ ((tableID!="")? '<div class="w3-display-topleft w3-theme w3-hover-grey w3-small w3-hover-shadow fas fa-globe" onclick="JL.saveTable(event, \''+tableID+'\')"></div></div>':'</div>');
}
