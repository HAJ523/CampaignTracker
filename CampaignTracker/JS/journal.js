//Instatiate a new journal on load.
var Journal = {}  //Object to hold journal functions.

//On input function to update the display of the journal. And to save the current page info off.
Journal.onInput = function(idSource, idTarget) {
  //Convert the values to wiki html format for display.
  document.getElementById(idTarget).innerHTML = wiki2html(document.getElementById(idSource).value);
}

Journal.savePage = function() {
  var page = data.selected;
  var content = document.getElementById('taJournalEditor').value;

  //If page and content null then there is nothing to save.
  if ((page == "") && (content == "")) {return;}

  //If we don't have a page and we have content then save to temp page.
  if ((page == "") && (content != "")) {
    page = "Temp/" + CT.tempID(8);
    data.selected = page;
  }

  //Check to make sure the page exists.
  if (!data.pages.hasOwnProperty(page)) {
    data.pages[page] = {};
    data.pages[page].content = "";
    CT.addIndex(page);
    CT.buildTree(); //Rebuild the tree if the page didn't exist.
  }

  data.pages[page].content = content;
}

//Called when clicking on a link on a journal page to transfer to another.
Journal.loadPage = function(pageTarget) {
  //Clear the screens before we load anything.
  var taJE = document.getElementById('taJournalEditor');
  var JD = document.getElementById('JournalDisplay');

  Journal.clear();

  //Now see if the page we want to load exists.
  if (pageTarget in data.pages) {
    taJE.value = data.pages[pageTarget].content;
    JD.innerHTML = wiki2html(taJE.value);
  } else {
    data.pages[pageTarget] = {};
    data.pages[pageTarget].content = "";
    CT.addIndex(pageTarget);
    CT.buildTree(); //Rebuild the tree if the page didn't exist.
  }

  data.selected = pageTarget;
}

Journal.clear = function() {
  //Clear the screens before we load anything.
  var taJE = document.getElementById('taJournalEditor');
  var JD = document.getElementById('JournalDisplay');

  taJE.value = "";
  while (JD.lastChild) {
    JD.removeChild(JD.lastChild);
  }
}
