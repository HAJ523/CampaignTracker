/*
  Limited Markdown translation to HTML for display

  Author: HAJ523
  2019-01 Created.
*/

var JL = {};

/*
  Scope: Public
  Description: Perform all single actions required prepare the journal.
*/
JL.onload = function() {
  //Save the element so that other functions don't look it up every time.
  JL.el = document.getElementById('JournalEditor');
}

/*
  Scope: Public
*/
JL.updateJournalDisplay = function() {
  //TODO Add page title as the first header w/o parrent folder information.
  document.getElementById('JournalDisplay').innerHTML = MD.toHTML(document.getElementById('JournalEditor').value);
}

/*
  Scope: Restricted (Journal.js)
  Description: Creates the journal object in the page data.
*/
JL.createJournalObject = function(page) {
  //Make sure that we are working with a blank slate.
  if (data.pages.hasOwnProperty(page)) { delete data.pages[page].J;}

  data.pages[page].J = {}
  data.pages[page].J.value = "";
}

/*
  Scope: Public
  Description: Load page data from the campaign.
*/
JL.loadPage = function() {
  //Make sure that the journal object is created for this page.
  if (!data.pages.hasOwnProperty(data.slctPage)) JL.createJournalObject(data.slctPage);
  if (!data.pages[data.slctPage].hasOwnProperty('J')) JL.createJournalObject(data.slctPage);

  //Load the data and update the display.
  document.getElementById('JournalEditor').value = data.pages[data.slctPage].J.value;
  JL.updateJournalDisplay();
}

/*
  Scope: Public
  Description: Save page data to the campaign.
*/
JL.savePage = function() {
  var el = document.getElementById('JournalEditor');
  //If there is not a currently selected page then we might need to create a temporary page.
  if ((data.slctPage == "") && (el.value != "")) {
    data.slctPage = 'Temporary Pages/' + CT.localISOTime();
    data.pages[data.slctPage] = {}; //Blank Page
    JL.createJournalObject(data.slctPage);
    CT.addPageToPageTree(undefined , data.slctPage);
  } else if (data.slctPage == "") { return; }

  //Make sure that the journal object is created for this page.
  if (!data.pages.hasOwnProperty(data.slctPage)) JL.createJournalObject(data.slctPage);
  if (!data.pages[data.slctPage].hasOwnProperty('J')) JL.createJournalObject(data.slctPage);

  data.pages[data.slctPage].J.value = el.value;
}

/*
  Scope: Public
  Description: Updates the highlighted text to be a header. Multiple lines will
    all become individual headers.
*/
JL.headerText = function(l) {
  var h = "#".repeat(l) + " ";
  var tx = JL.el.value.substring(JL.el.seletionStart, JL.el.selectionEnd).split(/\n/).map(function(e) { return h + e; }).join('\n');
  JL.el.value = JL.el.value.substring(0,JL.el.selectionStart) + tx + JL.el.value.substring(JL.el.selectionEnd);
  JL.el.focus();
  JL.updateJournalDisplay();
}

/*
  Scope: Public
  Description: Inserts a table at the start of the selection of the specified
    height and width.
*/
JL.insertTable = function(w, h) {
  var nl = ((JL.el.value.substring(JL.el.selectionStart-1,JL.el.selectionStart) == '\n') ? '' : '\n');
  JL.el.value = JL.el.value.substring(0,JL.el.selectionStart) +
    nl + '|' + ' Header |'.repeat(w) +'\n'
    + '|' + ':--|'.repeat(w) + '\n'
    + ('|' + '|'.repeat(w) + '\n').repeat(h)
    + JL.el.value.substring(JL.el.selectionStart);
  JL.el.focus();
  JL.updateJournalDisplay();
}

/*
  Scope: Public
  Description: Insert a tab character after every new line and at the start of
    the sting in the selected text in the journal editor textarea.
*/
JL.insertTab = function() {
  var tx = JL.el.value;
  var st = tx.substring(JL.el.selectionStart, JL.el.selectionEnd);
  var start = JL.el.selectionStart + 1;

  JL.el.value = tx.substring(0,JL.el.selectionStart) + st.replace(/(^|\n)/g,"$1\t") + tx.substring(JL.el.selectionEnd);

  //Update the selection and reset the focus incase this was triggered by clicking the control.
  JL.el.selectionStart = start
  JL.el.selectionEnd = start //TODO in the future this function should highlight all the updated text if selection start and end do not match up.
  JL.el.focus();
  JL.updateJournalDisplay();
}

/*
  Scope: Public
  Description: Adds a horizontal rule at the start location of the selection.
*/
JL.horizontalRule = function () {
  var start = JL.el.selectionStart + 3;
  var str = "---";
  if ((JL.el.selectionStart != 0) && (JL.el.value.substring(JL.el.selectionStart-1,JL.el.selectionStart) != "\n")) {str = "\n" + str; start++;}
  if (JL.el.value.substring(JL.el.selectionStart,JL.el.selectionStart+1) != "\n") {str += "\n"; start++;}
  JL.el.value = JL.el.value.substring(0,JL.el.selectionStart) + str + JL.el.value.substring(JL.el.selectionStart);
  JL.el.selectionStart = start;
  JL.el.selectionEnd = start;
  JL.el.focus();
  JL.updateJournalDisplay();
}

/*
  Scope: Public
  Description: Wrap highlighted text with bold, italic, underline, strikethrough
    markdown.
*/
JL.boldText = function() { JL.wrapTextByLine('**'); }
JL.italicText = function() { JL.wrapTextByLine('*'); }
JL.underlineText = function() { JL.wrapTextByLine('__'); }
JL.strikethroughText = function() { JL.wrapTextByLine('~~'); }

/*
  Scope: Private
  Description: Wraps text selection in specified characters in the Journal
    Editor.
  Parameters:
    c - Characters to wrap around text.
*/
JL.wrapTextByLine = function(c) {
  var len = c.length*2;
  var start = JL.el.selectionStart;
  var end = JL.el.selectionEnd;
  var cnt = 0;

  JL.el.value = JL.el.value.substring(0,start) + JL.el.value.substring(start,end).replace(/(?:^|\n).*/g, function(m) {
    cnt++;
    return ((m.startsWith('\n'))? '\n' + c + m.substring(1) : c + m) + c;
  }) + JL.el.value.substring(end);
  JL.el.selectionStart = start;
  JL.el.selectionEnd = end + (len*cnt);
  JL.el.focus();
  JL.updateJournalDisplay();
}

/*
  Scope: Public
  Description: Finds the next instance of ??? and marks it as selected.
*/
JL.selectNextHotText = function() {
  //Assume that we should start from the current selection.
  var start = JL.el.selectionEnd;
  var next = JL.el.value.indexOf('???', start);

  //If the next instance doesn't exist then try once more from the beginning.
  if (next == -1) {
    next = JL.el.value.indexOf('???');
  }

  //If we still don't have a value then there is nothing to do and quit.
  if (next == -1) { return; }

  //Update the selection.
  JL.el.selectionStart = next;
  JL.el.selectionEnd = next+3;
}
