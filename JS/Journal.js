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
  if (!data.pages.hasOwnProperty(data.slctPage)) {
    JL.createJournalObject(data.slctPage);
    CT.addPageToPageTree(data.slctPage);
  }
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
JL.headerText = function(el, l) {
  var h = "#".repeat(l) + " ";
  var tx = el.value.substring(el.selectionStart, el.selectionEnd).split(/\n/).map(function(e) { return h + e; }).join('\n');
  el.value = el.value.substring(0,el.selectionStart) + tx + el.value.substring(el.selectionEnd);
  el.focus();
  el.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true})); //Force the object to call it's input event.
}

/*
  Scope: Public
  Description: Inserts a table at the start of the selection of the specified
    height and width.
*/
JL.insertTable = function(el, w, h) {
  var nl = ((el.value.substring(el.selectionStart-1,el.selectionStart) == '\n') ? '' : '\n');
  el.value = el.value.substring(0,el.selectionStart) +
    nl + '|' + ' Header |'.repeat(w) +'\n'
    + '|' + ':--|'.repeat(w) + '\n'
    + ('|' + '|'.repeat(w) + '\n').repeat(h)
    + el.value.substring(el.selectionStart);
  el.focus();
  el.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
}

/*
  Scope: Public
  Description: Insert a tab character after every new line and at the start of
    the sting in the selected text in the journal editor textarea.
*/
JL.insertTab = function(el) {
  var tx = el.value;
  var st = tx.substring(el.selectionStart, el.selectionEnd);
  var start = el.selectionStart + 1;

  el.value = tx.substring(0, el.selectionStart) + st.replace(/(^|\n)/g,"$1\t") + tx.substring(el.selectionEnd);

  //Update the selection and reset the focus incase this was triggered by clicking the control.
  el.selectionStart = start
  el.selectionEnd = start //TODO in the future this function should highlight all the updated text if selection start and end do not match up.
  el.focus();
  el.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
}

/*
  Scope: Public
  Description: Adds a horizontal rule at the start location of the selection.
*/
JL.horizontalRule = function (el) {
  var start = el.selectionStart + 3;
  var str = "---";
  if ((el.selectionStart != 0) && (el.value.substring(el.selectionStart - 1, el.selectionStart) != "\n")) {str = "\n" + str; start++;}
  if (el.value.substring(el.selectionStart, el.selectionStart + 1) != "\n") {str += "\n"; start++;}
  el.value = el.value.substring(0,el.selectionStart) + str + el.value.substring(el.selectionStart);
  el.selectionStart = start;
  el.selectionEnd = start;
  el.focus();
  el.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
}

/*
  Scope: Public
  Description: Wrap highlighted text with bold, italic, underline, strikethrough
    markdown.
*/
JL.boldText = function(el) { JL.wrapTextByLine(el, '**'); }
JL.italicText = function(el) { JL.wrapTextByLine(el, '*'); }
JL.underlineText = function(el) { JL.wrapTextByLine(el, '__'); }
JL.strikethroughText = function(el) { JL.wrapTextByLine(el, '~~'); }

/*
  Scope: Private
  Description: Wraps text selection in specified characters in the Journal
    Editor.
  Parameters:
    c - Characters to wrap around text.
*/
JL.wrapTextByLine = function(el, c) {
  var len = c.length*2;
  var start = el.selectionStart;
  var end = el.selectionEnd;
  var cnt = 0;

  el.value = el.value.substring(0,start) + el.value.substring(start,end).replace(/(?:^|\n).*/g, function(m) {
    cnt++;
    return ((m.startsWith('\n'))? '\n' + c + m.substring(1) : c + m) + c;
  }) + el.value.substring(end);
  el.selectionStart = start;
  el.selectionEnd = end + (len*cnt);
  el.focus();
  el.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
}

/*
  Scope: Public
  Description: Finds the next instance of ??? and marks it as selected.
*/
JL.selectNextHotText = function(el) {
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

/*
  Scope: Public
  Description: Opens the selection menu for a template and opens one if selected.
*/
JL.insertTemplate = function(el, temp) { //Element to perform replacement in, Template to page to insert.

}
