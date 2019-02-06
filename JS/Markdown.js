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
  Returns:
    HTML
*/
MD.toHTML = function(s) {
  return s
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
  //Paragraph
  .replace(/(?:(?:^|\n)+((?:[^#\|\n>\-*+ ](?:.*)(?:\n|$))+))/g, function (m, a) {//Parameters Match, Paragraph   Returns: <p>Paragraph</p>
    return '\n<p>' + a.replace(/\n/g,"<br>") + '</p>\n';
  })
  //Block Qoute
  .replace(/(?:(?:^|\n)+((?:(?:>[ ]?){1}(?:.*)\n)+))/g, function(m, a) {//Parameters: Match, "> Text"   Return: <blockqoute>Text</blockqoute>
    return "\n<blockquote class=\"w3-panel w3-leftbar w3-light-grey\"><p>\"" + a.replace(/(?:>[ ]?)(.*)/g,"$1").replace(/\n[\s]*\n/g,"</p><p>").replace(/\n$/,"").replace(/\n/gm,"<br/>\n") + "\"</p></blockquote>\n";
  })
  //Code
  .replace(/(?:^|\n)'''[\n]?(.*?)'''/gs, function(m, a) {//Parameters: Match, Text   Return: <pre>Text</pre>
    return "\n<pre>" + a + "</pre>";
  })
  //Headers
  .replace(/(?:^|\n)([#]+)[\t ]*(.*)/g, function(m, a, b) { //Parameters: Match, #.*, Header   Return: <h#>text</h#>
    return '\n<h' + a.length + '>' + b + '</h' + a.length + '>';
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
    b = ((b == null) ? a : b);
    return '<img src="' + b + '" title="' + c + '">';
  })
  //Dice Roller
  .replace(/\?\[(.*?)\]/g, function(m, a) { //Parameters: Match, Roll   Return: <a href='roll'>Roll</a>
    var id = CT.GUID(8);
    return '<a href="javascript:RL.roll(\'' + a + '\',\'' + id + '\')" id="' + id + '" title="' + a + '">' + a + '</a>';
  })
  //Calculator
  .replace(/\&\[(.*?)\]/g, function(m, a) { //Parameters: Match, Equation   Return: <a href'calc'>Equation</a>
    return m;
  })
  //Links
  .replace(/\[(.*?)\/?([^\/]*?)\](?:\((\".*\"|[^ \n]*)[ ]?(.*)?\))?/g, function(m, a, b, c, d) { //Parameters: Match, Parent Folder, Page, Link, Title  Returns: <a href=Link title=Title>Page</a>
    a = ((a != "") ? [a, b].join("/") : b); //If there was a parent page then make sure that that is included in the link if Link is not populated.
    d = ((d == undefined)? "" : d);
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
    return '<a href="' + c + '" title="' + d + '">' + a + '</a>';
  })
  //Tables
  .replace(/((?:^|\n)\|.*?\n)(\|.*?\n)((?:\|.*?\n)*)/gs, function(m, a, b, c) {//Parameters: Match, Headers, Alignment, Data   Returns: <table>...</table>
    return MD.tableToHTML(a,b,c);
  })
  //Calculator TODO
  //Roller (Dice & Table) TODO
  //Sections TODO

  //Lists (Must remain at the bottom to avoid parsing mistakes with other elements!)
  .replace(/((?:^|\n)(?:[*+-]){1}(?:.*)(?:(?:^|\n)(?:[* +-][ ]?){1}(?:.*))*)/g, function (m, a) { //Parameters: Match, List   Returns: <ol/ul>...</...>
    return MD.listsToHTML(a);
  });
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
    if (sa[i]=="") {continue;}

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
  var ret = '<table class="w3-table w3-bordered w3-striped w3-margin-small"><thead><tr class="w3-theme">';
  var aln = [];

  //Alignment
  b.replace(/\|([^|\n]*)(?:\|\n)?/g, function(m, a) {
    aln.push((a.search(/^-+:/g) >= 0) ? ' style="text-align:right;"' : ((a.search(/^:-+:/g) >= 0) ? ' style="text-align:center;"' : "")); //Right, Center, Left (Default)
    return ""; //Return doesn't mean anything in this case.
  });

  //Headers
  var num = -1;
  ret += a.replace(/\|([^|\n]*)(?:\|\n)?/g, function(m, a) { //Parameters: Match, Column
    num++;
    return '<th' + (((aln[num]!="") && (aln[num] != undefined)) ? aln[num] : "") + '>' + a + '</th>';
  }) + '</tr></thead>';

  //Data
  var dAry = c.split(/\n/g);
  for (var i = 0; i < dAry.length; i++ ) {
    num =- 1;
    if (dAry[i]=="") {break;}
    ret += '<tr>' + dAry[i].replace(/\|([^|\n]*)(?:\|\n)?/g, function(m, a) { //Parameters: Match, Column
      num++;
      if (a=="") {return "";}
      return '<td' + (((aln[num]!="") && (aln[num] != undefined)) ? aln[num] : "") + '>' + a + '</td>';
    }) + '</tr>';
  }

  return ret + '</table>';
}
