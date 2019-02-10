/*
  Campaign Tracker parent scripts

  Author: HAJ523
  2019-01 Created.
*/

var CT = {}; //Initialize markdown object.

/*
  Scope: CT3.html
*/
CT.onLoad = function() {
  //Setup necessary global variables
  CT.resetData();

  //Call all onload functions for individual modules.
  JL.onload();
  ST.onload();
  KB.onload();

  //Load the default view
  CT.changeView("J");

  //Setup all Modal Animation End functions.
  document.getElementById('ModalPrompt').addEventListener('animationend', CT.modalAnimationEnd);

  //Keep the real time updated on the screen so that the user doesn't have to go somewhere else!
  CT.updateIRLTime();
  setInterval(CT.updateIRLTime,15000); //Only update every 15 seconds. No sense in doing this every second or less.

  CT.setStatus("Ready");
}

/*
  Scope: Restricted
  Description: Used to set any variables necessary during loading and a reset to
    blank state.
*/
CT.resetData = function() {
  //Current Campaign Data.
  delete data;
  data = {};
  data.pages = {};
  data.slctPage = "";
  data.slctView = ""; //Default to no view.
  data.settings = {};
  data.settings.name = "CT";
  /*data.images = [];
  data.history = {};
  data.settings.imagepath = "";
  data.settings.dice = "1d20";
  */
}

/*
  Scope: Restricted (CT3.html)
  Description: Save the current campaign.
*/
CT.saveData = function() {
  //Make sure that the currently active view saves its data.
  switch (data.slctView) {
    case "J":
      JL.savePage();
      break;
      //TODO Add new view saves here.
  }

  ST.saveData();
}

/*
  Scope: Restricted (CT3.html)
  Description: Load a campaign.
*/
CT.loadData = function(name) {
  if ((name=="") || (name == null)) return; //Nothing to do if the user didn't provide data.
  //TODO Save the current campaign if there is one open.

  //First load the database
  var loadReturn = ST.loadData(name);

  //Now make sure that the displays are updated to be the loaded data.
  CT.changeView(loadReturn[0]);
  CT.selectPage(data.slctPage, true); //Skip saving
}
CT.exportData = function() {} //TODO
CT.importData = function() {} //TODO

/*
  Scope: Restricted (CT3.html)
  Description: Creates a new page
*/
CT.newPage = function(page) {
  if (page == null) {
    return; //Nothing else to do the user cancelled.
  } else if (page == "") {
    page = 'Temporary Pages/' + CT.localISOTime();
  }

  //Make sure that the page has the correct kind of slashes!
  if (page.includes('\\')) {
    page = page.replace(/\\/g,"/");
  }

  //Check for the page to exist and if it doesn't then created it.
  if (data.pages.hasOwnProperty(page)) {
    alert("Page already exists none will be created."); //TODO update alert to be a status message.
  } else {
    data.pages[page] = {}; //Blank Page
  }

  //Make sure that we add the new page to the tree.
  CT.addPageToPageTree(document.getElementById('PageTree').children[0], page);

  CT.selectPage(page);
}

/*
  Scope: Restricted (CT3.html)
  Description: Selects a page for viewing.
*/
CT.selectPage = function(p, ss) {
  //TODO Save the old page infomration depending on the current view.
  if (!ss) {
    switch (data.slctView) {
      case "E":
        break;
      case "M":
        break;
      case "J":
        JL.savePage();
        break;
      default:
    }
  }
  //Mark the new page as selected.
  data.slctPage = p;
  document.getElementById('PageTitle').innerHTML = p;

  //TODO Check the page for data if there is no data for the current view then change the view.

  if (!data.pages.hasOwnProperty(p)) {
    data.pages[p] = {};
    CT.addPageToPageTree(undefined, p);
  }

  //Load the data and refresh the display.
  switch (data.slctView) {
    case "E":
      break;
    case "M":
      break;
    case "J":
      JL.loadPage();
      break;
    default:
  }
}

/*
  Scope: Restricted (CT3.html)
  Description: Change the view displayed to the user.
*/
CT.changeView = function(v) {
  //Clear any open view elements.
  if (data.slctView != "") {
    var toHide = document.getElementsByClassName("view" + data.slctView);
    for (var i = 0; i < toHide.length; i++) {
      if (!toHide[i].classList.contains("w3-hide")) { toHide[i].classList.add("w3-hide"); }
    }
  }

  //Update the selected view.
  data.slctView = v;

  //Remove the hide class from what should now be displayed.
  var toShow = document.getElementsByClassName("view" + data.slctView);
  for (var i = 0; i < toShow.length; i++) {
    if (toShow[i].classList.contains("w3-hide")) { toShow[i].classList.remove("w3-hide"); }
  }
}

/*
  Scope: Public
  Description: Open a modal window that must be accepted or canceled with a value.
*/
CT.prompt = function(callback, title, text, label, place) {
  //Change the modal info.
  CT.promptCallback = callback;
  document.getElementById('ModalPromptTitle').innerHTML = title;
  document.getElementById('ModalPromptText').innerHTML = text;
  document.getElementById('ModalPromptLabel').innerHTML = label;
  document.getElementById('ModalPromptResponse').placeholder = place;
  //Open the Modal
  CT.openModal('ModalPrompt')
  //Make the Entry Element Focused.
  document.getElementById('ModalPromptResponse').focus();
}

/*
  Scope: Restricted (CT3.html)
  Description: Execute the callback function from a prompt.
*/
CT.promptClose = function(state) {
  //Close the display.
  CT.closeModal(document.getElementById('ModalPrompt'));

  //Execute the callback.
  if (state) {
    CT.promptCallback(document.getElementById('ModalPromptResponse').value);
  } else {
    CT.promptCallback(null); //User cancelled the input.
  }
}

CT.openModal = function(m) {
  var e = document.getElementById(m);

  e.style.display = 'block';
}

CT.closeModal = function(e) {
  e.children[0].classList.add('w3-animate-top-r');
  e.classList.add('w3-animate-opacity-r');
}

CT.modalAnimationEnd = function() {
  if (this.children[0].classList.contains('w3-animate-top-r')) {
    this.style.display = 'none';
    this.classList.remove('w3-animate-opacity-r');
    this.children[0].classList.remove('w3-animate-top-r');
  }
}

/*
  Scope: Public
  Description: Builds the initial tree in the DOM.
*/
CT.buildPageTree = function() {
  //Create a new ordered list.
  var parentList = document.createElement('ol');

  //Loop over all of the pages and call the append element function.
  for (var p in data.pages) {
    CT.addPageToPageTree(parentList, p);
  }

  //Insert list into Page.
  var pt = document.getElementById('PageTree');
  pt.innerHTML = ""; //Make sure the element is clear before we add more to it.
  pt.appendChild(parentList);
}

/*
  Scope: Public
  Description: Insert a single element into the page tree in order.
  //TODO Add call to open page function.
*/
CT.addPageToPageTree = function(l, p, r) {
  //If no list was provided the assume the top level list!
  if (l == undefined) {
    l = document.getElementById('PageTree').children[0];
  }
  if (r == undefined) {
    r = "";
  }

  //Get the current portion of the key.
  var cKey = p.split(/\/(.+)/g);

  //Special handling incase there are not currently pages.
  if (l.children.length == 0) {
    l.innerHTML += '<li id="' + cKey[0] + '"></li>';
    var li = l.children[l.children.length-1];

    if (cKey.length > 1) {
      li.innerHTML='<label onclick="CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] + '</label><input type="checkbox"><ol></ol>';
      CT.addPageToPageTree(li.children[2], cKey[1], r + ((r != "")? "/" : "") + cKey[0]);
    } else {
      li.innerHTML = '<a href="javascript:CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] +'</a>';
      li.classList.add('file');
    }
  }

  for (var c = 0; c < l.children.length; c++) {
    if (l.children[c].id == cKey[0]) { //If we found the correct parent
      if (cKey.length > 1) { //There is more to this page than the current element. Recusion needed!
        //If the current li is not a parent then make it one!
        if (l.children[c].children.length == 1) { //TODO this will need to keep in mind that we are adding anchors for regular pages.
          l.children[c].innerHTML='<label onclick="CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] + '</label><input type="checkbox"><ol></ol>'; //Clear the element.
        }

        //Now recurse with the remaining page information.
        CT.addPageToPageTree(l.children[c].children[2], cKey[1], r + ((r != "")? "/" : "") + cKey[0]);
        break; //stop the for loop execution.
      } //Else there is nothing becuase this page already exists in the tree for selection!

    } else if (l.children[c].id > cKey[0]) { //If we have just passed the correct element then we need to perform an insert before this element.
      var li = document.createElement("li");
      li.id = cKey[0];

      //If there is more then add a parent node
      if (cKey.length > 1) {
        li.innerHTML='<label onclick="CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] + '</label><input type="checkbox"><ol></ol>';
      } else {
        li.innerHTML = '<a href="javascript:CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] +'</a>';
        li.classList.add('file');
      }

      //Insert before this element to maintain order.
      l.insertBefore(li, l.children[c]);

      //Now recurse if there was a reason to.
      if (cKey.length > 1) {
        CT.addPageToPageTree(li.children[2], cKey[1], r + ((r != "")? "/" : "") + cKey[0]);
      }

      //Break the loop here since we just did an insert.
      break;
    } else if (c == l.children.length - 1) { //If we are on the last child and still haven't found or been greater than the page in question we need to add to the list at the end!
      l.innerHTML += '<li id="' + cKey[0] + '"></li>';
      var li = l.children[l.children.length-1];

      if (cKey.length > 1) {
        li.innerHTML='<label onclick="CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] + '</label><input type="checkbox" ><ol></ol>';
        CT.addPageToPageTree(li.children[2], cKey[1]);
      } else {
        li.innerHTML = '<a href="javascript:CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] +'</a>';
        li.classList.add('file');
      }
    }
  }
}

/*
  Scope: Public
  Description: Remove a single page from the page tree. Will only remove parent
    elements if they have no children.
*/
CT.removePageFromPageTree = function(p) {

}

/*
  Scope: Public
  Description: Sets the status for the application.
*/
CT.setStatus = function(s) {
  document.getElementById('StatusTime').innerHTML = '&nbsp;' + CT.localISOTime().split(' ')[1] + '&nbsp;';
  document.getElementById('Status').innerHTML = s;
}

/*
  Scope: Private
  Description: Keep the local time displayed on the bottom of the screen.
*/
CT.updateIRLTime = function() {
  document.getElementById('IRLClock').innerHTML = new Date().toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12:true}) + "&nbsp;";
}

/*
  Scope: Public
  Description: Get the local time in ISO format.
*/
CT.localISOTime = function() {
  var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -5).replace("T"," ");
}

/*
  Scope: Public
  Description: Temporary ID function. Used when a matching identifier is necessary.
*/
CT.GUIDArray = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","x","y","z","1","2","3","4","5","6","7","8","9","0"];
CT.GUID = function(l) {
  var ID = "";
  for (var i = 0; i < l; i++) {
    ID += CT.GUIDArray[Math.floor(Math.random() * CT.GUIDArray.length)];
  }
  return ID;
}

/*
  Scope: Public
  Description: Swap the theme to another one.
*/
CT.changeTheme = function(n) {
  document.getElementById('theme').href = "CSS\\themes\\w3-" + n + ".css";
}
