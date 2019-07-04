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
  JL.onLoad();
  ST.onLoad();
  KB.onLoad();
  MR.onLoad();
  EN.onLoad();

  //Load the default view
  CT.changeView("J");

  //Setup all Modal Animation End functions.
  document.getElementById('ModalPrompt').addEventListener('animationend', CT.modalAnimationEnd);
  document.getElementById('PageSettings').addEventListener('animationend', CT.modalAnimationEnd);
  document.getElementById('CampaignSettings').addEventListener('animationend', CT.modalAnimationEnd);
  document.getElementById('ImageDisplay').addEventListener('animationend', CT.imageAnimationEnd);

  //Keep the real time updated on the screen so that the user doesn't have to go somewhere else!
  CT.updateIRLTime();
  setInterval(CT.updateIRLTime,15000); //Only update every 15 seconds. No sense in doing this every second or less.

  CT.setStatus("Ready");

  MG.onload();
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
  data.settings.name = "";
  data.settings.dice = "1d20";
  data.tables = {};
  data.palettes = {};
  /*data.images = [];
  data.history = {};
  data.settings.imagepath = "";
  */
}

/*
  Scope: Restricted (CT3.html)
  Description: Start of saving process.
*/
CT.saveData = function() {
  CT.prompt(CT.saveDataFinalize, "Save Campaign", "Name to save campaign as?", "Name", "Campaign Name", data.settings.name);
}

/*
  Scope: Restricted (Campaing Tracker)
  Description: Finalize the saving process for the current campaign.
*/
CT.saveDataFinalize = function(name) {
  if ((name == null) || (name == "")) {return;} //If we cancelled or a bad name is selected then quit.

  data.settings.name = name; //Update the name!

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

  //If we have another campaign open already then save it before we move on.
  if (data.settings.name != "") { CT.saveDataFinalize(data.settings.name); }

  //Make sure that the name provided is data that can be loaded.
  //if (!ST.listCampaigns().contains(name)) { see List campaigns before uncommenting this.
  //  CT.setStatus(name + " doesn't exist in database.");
  //  return;
  //}

  //First load the database
  ST.loadData(name);
}

CT.finishLoad = function(v) {
  //Now make sure that the displays are updated to be the loaded data.
  CT.changeView(v);
  CT.buildPageTree();
  CT.selectPage(data.slctPage, true); //Skip saving
  CT.setTitles();

  CT.setStatus("Campaign successfully loaded.");

}

CT.setTitles = function() {
  document.getElementById('ctTitle').innerHTML = "Campaign Tracker - " + data.settings.name;
  document.getElementById('Title').innerHTML = data.settings.name;
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
    CT.setStatus("Page '" + page + "' already exists none will be created."); //TODO update alert to be a status message.
  } else {
    data.pages[page] = {}; //Blank Page
  }

  //Make sure that we add the new page to the tree.
  CT.addPageToPageTree(document.getElementById('PageTree').children[0], page);

  CT.selectPage(page);
}

CT.deletePage = function() {
  CT.closeModal(document.getElementById("PageSettings"));
  delete data.pages[data.slctPage];

  CT.removePageFromPageTree(undefined, data.slctPage);
  switch (data.slctView) {
    case "E":
      break;
    case "M":
      break;
    case "J":
      JL.clearJournalDisplay();
      break;
    default:
  }

  document.getElementById('PageTitle').innerHTML = "";
}

/*
  Scope: Restricted (CT3.html)
  Description: Selects a page for viewing.
*/
CT.selectPage = function(p, ss) {
  if ((p=="") || (p==undefined)) return; //Don't do anythign if there is nothing selected!

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
      if (!data.pages[data.slctPage].hasOwnProperty("M")) {
        CT.changeView("J");
      } else {
        MR.initMapper();
      }
      break;
    case "J":
      JL.loadPage();
      break;
    default:
  }
}

/*
  Scope: Restricted (CT3.html)
  Description: Open the edit page modal.
*/
CT.editPage = function() {
  var pagePath = document.getElementById("PageSettingsPath");

  //TODO Load the current page settings.
  pagePath.value = data.slctPage;

  if (data.pages.hasOwnProperty(data.slctPage)) {
    if (data.pages[data.slctPage].hasOwnProperty('M')) {
      document.getElementById('PageSettingsColor').value = data.pages[data.slctPage].M.C;
    } else {
      document.getElementById('PageSettingsColor').value = "#000000";
    }
  }
  CT.openModal("PageSettings");

  pagePath.focus();
}

CT.settingsPage = function() {
  var newPath = document.getElementById('PageSettingsPath').value;

  //Don't continue if page isn't set!
  if (newPath=="") {CT.cancelPage(); return;}

  //Only update the page path if that is necessary.
  if (data.slctPage != newPath) {
    if (data.pages.hasOwnProperty(newPath)) {
      CT.setStatus("Page already exists at path: " + newPath);
    } else {
      if (data.slctPage != newPath) {
        //If the page previously existed.
        if ((data.slctPage != "") && (data.slctPage != undefined)) {
          //Remove the old data.
          delete data.pages[data.slctPage];
          CT.removePageFromPageTree(undefined, data.slctPage);
        }

        //Save page to new location.
        data.slctPage = newPath;
        CT.addPageToPageTree(undefined, newPath);
        CT.selectPage(newPath);
      }
    }
  }

  //Save the additional page settings!
  var c = document.getElementById('PageSettingsColor').value;

  //Set map color
  MR.setMapDetails(data.slctPage, c);

  CT.cancelPage();
}

CT.cancelPage = function() {
  CT.closeModal(document.getElementById("PageSettings"));
}

/*
  Scope: Restricted (CT3.html)
  Description: Change the view displayed to the user.
*/
CT.changeView = function(v) {
  //check to make sure the view can be changed
  switch(v) {
    case "M":
    case "E":
      if (data.slctPage=="") {CT.setStatus("Page doesn't exist."); return;}
  }

  //Clear any open view elements.
  if (data.slctView != "") {
    var toHide = document.getElementsByClassName("view" + data.slctView);
    for (var i = 0; i < toHide.length; i++) {
      if (!toHide[i].classList.contains("w3-hide")) { toHide[i].classList.add("w3-hide"); }
    }

    //Call closing code if there is any.
    switch(data.slctView) {
      case "M":
        MR.closeMapper();
        break;
      case "E":
        EN.closeEncounter();
        break;
    }
  }

  //Update the selected view.
  data.slctView = v;

  //Remove the hide class from what should now be displayed.
  var toShow = document.getElementsByClassName("view" + data.slctView);
  for (var i = 0; i < toShow.length; i++) {
    if (toShow[i].classList.contains("w3-hide")) { toShow[i].classList.remove("w3-hide"); }
  }

  //Finalize actions that must happen after the new elements are visible.
  switch(v) {
    case "E":
      EN.initEncounter();
      break;
    case "M":
      MR.initMapper();
      break;
  }
}

/*
  Scope: Public
  Description: Open a modal window that must be accepted or canceled with a value.
*/
CT.prompt = function(callback, title, text, label, place, value) {
  //Change the modal info.
  CT.promptCallback = callback;
  document.getElementById('ModalPromptTitle').innerHTML = title;
  document.getElementById('ModalPromptText').innerHTML = text;
  document.getElementById('ModalPromptLabel').innerHTML = label;
  document.getElementById('ModalPromptResponse').placeholder = place;
  document.getElementById('ModalPromptResponse').value = ((value!=undefined)? value:"");
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

/*
  Scope: Public
  Description: Swaps the shown and hidden classes associated with an element.
*/
CT.toggleHideShow = function(e) {
  if (e.classList.contains("w3-hide")) {
    e.classList.remove("w3-hide");
    e.classList.add("w3-show");
  } else {
    e.classList.remove("w3-show");
    e.classList.add("w3-hide");
  }
}

CT.openModal = function(m) {
  CT.toggleHideShow(document.getElementById(m));
}

CT.closeModal = function(e) {
  e.children[0].classList.add('w3-animate-top-r');
  e.classList.add('w3-animate-opacity-r');
}

CT.modalAnimationEnd = function() {
  if (this.children[0].classList.contains('w3-animate-top-r')) {
    CT.toggleHideShow(this);
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
*/
CT.addPageToPageTree = function(l, p, r) { //Parameters: List, Page,
  //If no list was provided the assume the top level list!
  l = ((l == undefined) ? document.getElementById('PageTree').children[0] : l );
  r = ((r == undefined) ? "" : r);

  //Get the current portion of the key.
  var cKey = p.split(/\/(.+)/g);

  //Special handling incase there are not currently pages.
  if (l.children.length == 0) {
    l.innerHTML += '<li id="' + cKey[0] + '"></li>';
    var li = l.children[l.children.length-1];
    li.innerHTML = '<label onclick="CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] + '</label><input type="checkbox">';
    if (cKey.length > 1) {
      li.innerHTML+='<ol></ol>';
      CT.addPageToPageTree(li.children[2], cKey[1], r + ((r != "")? "/" : "") + cKey[0]);
    }
  }

  //Loop over the existing children in the list to find the correct one.
  for (var c = 0; c < l.children.length; c++) {
    if (l.children[c].id == cKey[0]) { //If we found the correct parent or page
      if (cKey.length > 1) { //There is more to this page than the current element. Recusion needed!
        //If the current li is not a parent then make it one!
        if (l.children[c].children.length == 2) {
          l.children[c].innerHTML += '<ol></ol>'; //Append a new list.
        }

        //Now recurse with the remaining page information.
        CT.addPageToPageTree(l.children[c].children[2], cKey[1], r + ((r != "")? "/" : "") + cKey[0]);
      } //Else there is nothing because this page already exists in the tree for selection!
      break; //stop the for loop execution.
    } else if (l.children[c].id > cKey[0]) { //If we have just passed the correct element then we need to perform an insert before this element.
      var li = document.createElement("li");
      li.id = cKey[0];
      li.innerHTML = '<label onclick="CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] + '</label><input type="checkbox">';

      //Insert before this element to maintain order.
      l.insertBefore(li, l.children[c]);

      //Now recurse if there was a reason to.
      if (cKey.length > 1) {
        li.innerHTML += '<ol></ol>';
        CT.addPageToPageTree(li.children[2], cKey[1], r + ((r != "")? "/" : "") + cKey[0]);
      }

      //Break the loop here since we just did an insert.
      break;
    } else if (c == l.children.length - 1) { //If we are on the last child and still haven't found or been greater than the page in question we need to add to the list at the end!
      l.innerHTML += '<li id="' + cKey[0] + '"><label onclick="CT.selectPage(\'' + r + ((r != "")? "/" : "") + cKey[0] + '\');">' + cKey[0] + '</label><input type="checkbox" ></li>';
      var li = l.children[l.children.length-1];
      if (cKey.length > 1) {
        li.innerHTML += '<ol></ol>';
        CT.addPageToPageTree(li.children[2], cKey[1]);
      }
      break; //This should not be necessary but for safety.
    }
  }
}

/*
  Scope: Public
  Description: Remove a single page from the page tree. Will only remove parent
    elements if they have no children and no data.
  Requires: Page data is already deleted.
*/
CT.removePageFromPageTree = function(l, p, r) {
  //If no list was provided the assume the top level list!
  l = ((l == undefined) ? document.getElementById('PageTree').children[0] : l );
  r = ((r == undefined) ? "" : r);

  //Make sure we stop if there isn't currently anything in the list.
  if (l.children.length == 0) return;

  var cKey = p.split(/\/(.+)/g);

  //Loop through the current list.
  for (var c = 0; c < l.children.length; c++) {

    //Find the correct page if there is one.
    if (l.children[c].id == cKey[0]) {
      //If there are multiple peices to the key then we know that we will need to recurse first.
      if (cKey.length > 1) {
        //If the current element has a sublist.
        if (l.children[c].children.length == 3) {
          CT.removePageFromPageTree(l.children[c].children[2], cKey[1], r + ((r != "")? "/" : "") + cKey[0]);
        }
      }

      //Now check to see if there we should remove this entry. (It has not children)
      if ((l.children[c].children.length < 3) && (!data.pages.hasOwnProperty(r + ((r != "")? "/" : "") + cKey[0]))) {
        l.removeChild(l.children[c]);
      }

      //If we were the last entry in the list then remove the ordered list of the parent also!
      if (l.children.length == 0) {
        if (l !== document.getElementById('PageTree').children[0]) {
          l.parentElement.removeChild(l);
        }
      }
      return;
    }

    //If we have traveled past the key in the list then break the loop as there is nothing else to do.
    if (l.children[c].id > cKey[0]) {
      return;
    }
  }
}

/*
  Scope: Public
  Description: Sets the status for the application.
*/
CT.setStatus = function(s, t, y, h) { //string, title, type, header
  var el = document.getElementById("StatusDisplay");
  var c = document.createElement("blockqoute");
  //Setup display.
  c.innerHTML = ((h == undefined)? "":"<strong>"+h+"</strong><br>")+((s == undefined) ? "":s);
  c.classList.add(((y == undefined) ? "stat-ct" : y));
  c.title = ((t == undefined) ? "" : t);
  //Append element.
  if (el.children.length > 20) { //TODO make the max configurable
    el.removeChild(el.children[20]); //If there are to many children remove the oldest.
  }
  el.prepend(c);
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

/*
  Scope: Public
  Description: Copy the contents of the element into the clipboard.
*/
CT.copy = function(e) {
  var range = document.createRange();
  range.selectNode(e);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
}

/*
  Scope: Public
  Description: Opens the image viewer.
*/
CT.imageShow = function(img) {
  document.getElementById("ImageDisplay").classList.add("w3-display-flex-center");
  document.getElementById("ImageDisplayImg").src = img.src;
}

/*
  Scope: Public
  Description: Starts the closing animations for the image viewer.
*/
CT.imageClose = function() {
  document.getElementById("ImageDisplay").classList.add("w3-animate-opacity-r");
  document.getElementById("ImageDisplayImg").classList.add("w3-animate-zoom-r");
}

/*
  Scope: Public
  Description: Completes the closing operations for the image viewer.
*/
CT.imageAnimationEnd = function() {
  if (this.children[0].classList.contains('w3-animate-zoom-r')) {
    this.classList.remove('w3-display-flex-center');
    this.classList.remove('w3-animate-opacity-r');
    this.children[0].classList.remove('w3-animate-zoom-r');
  }
}

CT.freeRoll = function(a) {
  var el=document.getElementById('FreeRoll');
  if (a) {
    RL.roll(el.value, "Free Roll");
  }
  el.value = "";
}
