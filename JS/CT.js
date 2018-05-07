var CT = {};
//Initialize the global data node.
var data;

CT.resetData = function() {
  delete data;
  data = {};
  data.pages = {};
  data.index = {};
  data.images = [];
  data.selected = "";
  data.display = "Journal"; //Default to viewing the journal.
  data.history = []; //Array of the page history.
  data.settings = {};
  data.settings.name = "CT";
  data.settings.imagepath = "";
  data.settings.dice = "1d20";
}

CT.resetData();


CT.fileDL = null;
CT.displayOptions = {};
CT.displayOptions.Map = "MapDiv";
CT.displayOptions.Journal = "JournalTable";

CT.onload = function() {
  //Keep the time.
  CT.updateTime();
  setInterval(CT.updateTime, 15000);

  //Setup any modals with tabs.
  CT.settingsTab('Main');

  //Set the status message.
  CT.setStatus("Ready");

  //Fix Leaflet Coordinate distance calculation!
  L.LatLng.prototype.distanceTo = function (other) {
    var dx = other.lng - this.lng;
    var dy = other.lat - this.lat;
    return Math.sqrt(dx * dx + dy * dy);
  }

  //if (document.getElementById("ImportTest").import != "") {
//    alert(document.getElementById("ImportTest").import);
//  }
}

CT.updateTime = function() {
  document.getElementById('ctClock').innerHTML = new Date().toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12:true}) + "&nbsp;";
}

CT.setStatus = function(text) {
  document.getElementById("ctStatus").innerHTML = "&nbsp;" + text +".";
}

//JSON file creation
CT.makeJSONFile = function() {
  //Strigify the global data object and place in a blob.
  var filedata = new Blob([JSON.stringify(data)],{type: 'text/plain'});

  if (CT.fileDL !== null) {
    window.URL.revokeObjectURL(CT.fileDL);
  }

  CT.fileDL = window.URL.createObjectURL(filedata);

  return CT.fileDL;
}

//Save the File of everything in data!
CT.saveFile = function() {

  var today = new Date();
  var strDate = today.getFullYear()+""+("0" + (today.getMonth() + 1)).slice(-2)+""+("0" + today.getDate()).slice(-2);

  //Make sure that the screen we are showing is saved before we allow the file to be created so that nothing is missing.
  if (data.display == "Journal") { Journal.savePage(); }

  //Create a download link hidden at the bottom of the page to be clicked.
  var link = document.createElement('a');
  link.setAttribute('download',data.settings.name+'-'+strDate+'.json');
  link.href = CT.makeJSONFile();
  document.body.appendChild(link);

  window.requestAnimationFrame(function () {
    link.dispatchEvent(new MouseEvent('click'));
    document.body.removeChild(link);
  });
}

//Load a file from user input.
CT.loadFile = function() {
  document.getElementById('ifLoad').dispatchEvent(new MouseEvent('click'));
}

//Start an image file load from user input.
CT.loadImageStart = function() {
  document.getElementById('csImageFile').dispatchEvent(new MouseEvent('click'));
}

//Read file
CT.readFile = function(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    CT.loadJSONFile(contents);
  };
  reader.readAsText(file);
}

//Remove element from images array.
CT.imageDelete = function() {
    var index = parseInt(document.getElementById('csIntImages').value);

    if (index >= 0) {
      data.images.splice(index,1);

      CT.popImageSelect(); //Repopulate the selecter.
      if (data.images.length > 0) {
        document.getElementById('csIntImg').src=data.images[0].data; //Remove the image from display.
      }
      document.getElementById('csIntImages').value = 0; //Reset to the first element as selected.
    }
}

CT.copyImageName = function() {
  var index = parseInt(document.getElementById('csIntImages').value);
  if (index >= 0) {
    CT.setClipboard('[[Img:'+data.images[index].name+']]');
  }
}

CT.setClipboard = function(value) {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

CT.loadImage = function(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }

  var reader = new FileReader();
  reader.onload = (function(file) { return function(e) {
    var contents = e.target.result;
    var index;

    [data.images, index] = Arylib.insert({name:file.name.split(/\./)[0], data:contents},data.images,function(e) {return e.name;});
    //Reload the contents of the images drop down.
    CT.popImageSelect();

    //Set our current image to selected.
    document.getElementById('csIntImages').value = index;
    document.getElementById('csIntImg').src = contents;
  }})(file);
  reader.readAsDataURL(file);
}

CT.loadSettingsImage = function() {
  document.getElementById('csIntImg').src = data.images[document.getElementById('csIntImages').value].data;
}

CT.popImageSelect = function() {
  var select = document.getElementById('csIntImages');

  select.innerHTML = "";

  for (var i = 0; i < data.images.length; i++) {
    select.innerHTML += "<option value=\"" + i + "\">" + data.images[i].name + "</option>";
  }
}

CT.loadJSONFile = function(json) {
  var dispcur = data.display;
  CT.resetData();
  data = JSON.parse(json);
  var dispfut = data.display;
  data.display = dispcur; //Set the system state to match actual state on load. Then switch back using CT.change


  //Updates here for displays
  CT.buildTree();
  CT.loadPage(data.selected, true, true);
  CT.changeDisplay(dispfut, true, true); //Reload the display.
  document.title = data.settings.name + " - Campaign Tracker";
  document.getElementById('ctTitle').innerHTML = data.settings.name;
}

//Change display between map, calendar, journal, etc.
CT.changeDisplay = function(disp, skipsave, skipback) {
  var oldDisp = data.display;

  //If we are changing displays the hide the current display.
  if (oldDisp != disp) {
    document.getElementById(CT.displayOptions[oldDisp]).classList.add('w3-hide');

    //If we change display here then we need to save the current journal data.
    if ((oldDisp == "Journal") && (!skipsave)) {
      Journal.savePage();
    }
  }

  //Activate the single display item.
  document.getElementById(CT.displayOptions[disp]).classList.remove('w3-hide');

  //If we are opening a map then there is more setup required. when there is a map image available.
  if ((data.selected != "") && (disp == "Map")) {
    //If there is a global leaflet map then remove it. (Always when visiting the map screen)
    if  (Map.hasOwnProperty('lmap')) {
      Map.lmap.remove();
      delete Map.lmap;
    };

    //Always allow the map to update itself.
    Map.createLMap();
  }

  //Last update the display to the new display.
  data.display = disp;

  //Save back button info.
  if (!skipback) {CT.saveBackInfo();}
}

CT.pagePropertiesModal = function() {
  //Open the new page modal
  CT.newPageModal(1);

  //Only able to load if we have data to load.
  if (data.selected == "") {return;}
  if (!data.pages.hasOwnProperty(data.selected)) {return;}

  //Fill it with the selected data.
  document.getElementById('ppPath').value = data.selected;
  document.getElementById('ppPathOriginal').value = data.selected;

  //Get map data.
  if (data.pages[data.selected].hasOwnProperty('map')) {
    document.getElementById('ppMapFileDisplay').innerHTML = data.pages[data.selected].map.name;
    document.getElementById('ppMapWidth').value = data.pages[data.selected].map.width;
    document.getElementById('ppMapHeight').value = data.pages[data.selected].map.height;
    document.getElementById('ppMapPPU').value = data.pages[data.selected].map.ppu;
  }
}

CT.markerModal = function(markerID) {


  //If we have a link for this marker make it appear.
  if (data.pages[data.selected].map.markers[markerID].hasOwnProperty('link')) {
    document.getElementById('emLink').value = data.pages[data.selected].map.markers[markerID].link;
  }

  //Set the modal to display and update the final html. Then set input focus.
  document.getElementById('mpModal').style.display = "block";
  document.getElementById('mpID').innerHTML = markerID;
}

CT.loadIntImg = function(element) {
  //If there is no data to search through then quit.
  if (data.images.length == 0) return "";

  //Look for an element to return.
  var loc = Arylib.locate(element,data.images,function(e){return e.name;});
  if (loc < 0) return "";

  return data.images[loc].data;
}

CT.saveMarker = function() {
  var markerID = document.getElementById('mpID').innerHTML;
  var link = document.getElementById('mpLink').value;

  //Only allow the link to be updated if it was already valued or it is now valued.
  if (data.pages[data.selected].map.markers.hasOwnProperty(link) || (link != "")) {

    //If we are here and link is null then the user wants to delete the link.
    if (link == "") {
      delete data.pages[data.selected].map.markers[markerID].link;
    } else {
      data.pages[data.selected].map.markers[markerID].link = link;
    }
  }

  //Now that we are done with the modal and saved close it.
  document.getElementById('mpModal').style.display = "none";
}

CT.pictureDisplay = function(e) {
  //Get the source for the image from the image that was clicked.
  document.getElementById('idImg').src = e.target.src;

  //Add wheel zoom to the large display.
  //TODO

  //Now that the image is filled block the screen.
  document.getElementById('idBackground').style.display = "table";
}

CT.pictureClose = function(e) {
  if (e.target.id == "PictureDisplayContent") {
    document.getElementById('PictureDisplayBackground').style.display = "none";
  }
}

CT.settings = function() {
  //Load values into settings.
  document.getElementById('csName').value = data.settings.name;
  document.getElementById('csLocImgPath').value = data.settings.imagepath;
  document.getElementById('csDefaultDice').value = data.settings.dice;

  //Reload the contents of the images drop down.
  CT.popImageSelect();

  //Load the current image.
  var selected = document.getElementById('csIntImages').value
  if (selected != "") {
    document.getElementById('csIntImg').src = data.images[selected].data;
  }

    //Display modal.
    document.getElementById('csModal').style.display = "block";
}

CT.settingsTab = function(tab) {
  var i, list;

  //Remove the display from the contents.

  list = document.getElementsByClassName("csTab");
  for (i = 0; i < list.length; i++) {
    list[i].style.display = "none";
  }
  //Remove the grey from the menu items.
  list = document.getElementsByClassName("csMenu");
  for (i = 0; i < list.length; i++) {
    list[i].classList.remove("w3-theme-d2");
  }
  document.getElementById("csTab" + tab).style.display = "block";
  document.getElementById("csMenu" + tab).classList.add("w3-theme-d2");
}

CT.saveSettings = function() {
  var name = document.getElementById('csName').value;
  var imagepath = document.getElementById('csLocImgPath').value;
  var dice = document.getElementById('csDefaultDice').value;

  //Only overwrite the name with a value if one is provided do not allow deletion.
  if (name != "") {
    data.settings.name = name;
  }

  //Likely someone might want to remove this but as we cannot be sure that the values in the journal don't depend on in dont allow it for now.
  if (imagepath != "") {
    data.settings.imagepath = imagepath;
  }

  if (dice != "") {
    data.settings.dice = dice;
  }

  //Update page displays for titles.
  document.title = data.settings.name + " - Campaign Tracker";
  document.getElementById('ctTitle').innerHTML = data.settings.name

  //Now close the Modal.
  document.getElementById('csModal').style.display = "none";
}

CT.newPageModal = function(skipClear) {

  //Make sure the first thing that happens is that we save the current page.
  if ((data.display == "Journal") && !skipClear) {
    Journal.savePage();
    Journal.clear();
  }

  //Display the Modal
  document.getElementById('ppModal').style.display = 'block';

  //document.getElementById('ppPath').focus(); //Make sure we focus on the first field for input to allow tabing.
}


//Onclick function for closing the modal window.
CT.closeModal = function(e) {
  if (e.target.id == "ModalBackground") {
    e.target.style.display = "none";
    delete data.temp; //Make sure that we don't bleed data.
  }
}

CT.tempArray = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","x","y","z"];

CT.tempID = function(length) {
  var pageID = "";
  for (var i = 0; i < length; i++) {
    pageID += CT.tempArray[Math.floor(Math.random() * CT.tempArray.length)];
  }
  return pageID;
}

CT.savePage = function () {
  var page = document.getElementById('ppPath').value;
  var orig = document.getElementById('ppPathOriginal').value;

  //If we didn't receive a page input then we need to determine what to do. We should use default temporary page name.
  if (page == "") {
    page = "Temp/" + CT.tempID(8);
  }

  //Check to see if they are overwriting an existing page and warn.
  if ((page != orig) && CT.isPage(page)) {
    if (!window.confirm("The page '" + page + "' already exists. Overwrite the page?")) {return;}
    //Copy page contents. to make sure nothing is lost.
    data.pages[page] = data.pages[orig];
  } else if (!CT.isPage(page)) {
    data.pages[page] = {};
  }

  //If there is a original page that isn't the same as the current entry. And remove the index.
  if ((orig != "") && (orig != page)) {
    delete data.pages[orig];
    CT.removeIndex(orig);
    data.selected = ""; //Make sure that we don't have a page selected anymore so that load page does the right thing.
  }

  //Save Journal Content
  data.pages[page].content = document.getElementById('taJournalEditor').value;

  //Check map values for updates:
  var width = document.getElementById('ppMapWidth').value;
  var height = document.getElementById('ppMapHeight').value;
  var ppu = document.getElementById('ppMapPPU').value;
  if (((width != "") || (height != "") || (ppu != "")) && (!data.hasOwnProperty('temp'))) data.temp = {};
  if (width != "") data.temp.width = width;
  if (height != "") data.temp.height = height;
  if (ppu != "") data.temp.ppu = ppu;

  //Save Map Content
  if (data.hasOwnProperty('temp')) {
    if (!data.pages[page].hasOwnProperty('map')) {
      data.pages[page].map = {};
    }
    if (data.temp.name != "") data.pages[page].map.name = data.temp.name;
    if (data.temp.ppu < 1) {data.temp.ppu = 1};
    data.pages[page].map.width = data.temp.width;
    data.pages[page].map.height = data.temp.height;
    data.pages[page].map.bounds = [[0,0],[data.temp.height/data.temp.ppu,data.temp.width/data.temp.ppu]];
    data.pages[page].map.ppu = data.temp.ppu;
    if (data.temp.hasOwnProperty('image')) data.pages[page].map.image = data.temp.image;
    data.pages[page].map.markers = {}; //Updating a page can potentially drastically change the scale so remove all markers.
    delete data.temp; //Make sure that we don't bleed data.
  }


  //Add Page to page index.
  CT.addIndex(page);

  //Update the Tree display & Load the page.
  CT.buildTree();
  CT.loadPage(page,1); //skip saving since we already saved if neccessary above.

  //Close the Modal
  document.getElementById('ppModal').style.display = "none";
  data.selected = page;
}

//Add to the page index.
CT.addIndex = function(page) {
  //Initial location for index base.
  var partialAddress = "data.index"
  var ary = page.split(/\//g); //Split page on on forward slashes.

  //Loop over all of the parent names.
  for (var i = 0; i < ary.length; i++) {

    //If we don't have this node in the Index then add it.
    if (!eval(partialAddress+".hasOwnProperty(ary[i])")) {
      partialAddress += "." + ary[i];
      eval((partialAddress+" = {};")); //Create Object in Object.
    } else { //Otherwise move to the next node.
      partialAddress += "." + ary[i];
    }
  }
}

//Perform a page removal from the index.
CT.removeIndex = function(page) {
  var indexLocal = page.replace(/\//g,'.');

  CT.removeIndexHelper(indexLocal);
}

//Helper recursion function to handle page removal.
CT.removeIndexHelper = function(indexLocal) {
  //If this node doesn't have children then remove it.
  if ((Object.keys(eval("data.index." + indexLocal)).length === 0) /*&& (eval(indexLocal).constrcutor === Object)*/) {
    eval("delete data.index." + indexLocal);

    //If there are more sub indicies check them as well using recursion.
    if (indexLocal.lastIndexOf('.') > 0) {
      indexLocal = indexLocal.substring(0,indexLocal.lastIndexOf('.'));
      CT.removeIndexHelper(indexLocal);
    }
  }
}

CT.filterTree = function(e, skipsave) {
  var origValue = document.getElementById('ctPageSearch').value;
  var filterValue = origValue.toUpperCase();
  var list = document.getElementById('ctPageTree').getElementsByTagName('li');
  var tab = 0;

  //if just the escape key was hit.
  if (e.key === "Escape") {
    //Clear the current search as it is no longer noteworthy.
    document.getElementById('ctPageSearch').value = "";
    filterValue = "";
  }

  //If the user hit the enter key the navigate to the exact page.
  if (e.key === "Insert") {
    //Clear the current search as it is no longer noteworthy.
    document.getElementById('ctPageSearch').value = "";

    CT.loadPage(origValue, skipsave); //TODO Sanitize input

    filterValue="";
  }

  if (e.key === "Enter") {
      document.getElementById('ctPageSearch').value = "";
      tab = 2;
  }

  for(var i = 0; i < list.length; i++) {
    if (list[i].id.toUpperCase().indexOf(filterValue) > -1) {
      list[i].style.display = "";
      if (tab == 2) {
        tab = 1;
        CT.loadPage(list[i].id.replace(/tree-/g,""), skipsave);
      }
    } else if (tab) {
      list[i].style.display = "";
    } else {
      list[i].style.display = "none";
    }
  }
}

//Build the tree display.
CT.buildTree = function() {
  var e = document.getElementById('ctPageTree');

  //Erase the current contents of the element.
  while (e.lastChild) {
    e.removeChild(e.lastChild);
  }

  //Now build everything back into the tree.
  CT.buildTreeHelper(e,"data.index","","");
}

CT.buildTreeHelper = function(e,indexLocal,item,level) {
  //Build this thing if item was populated.
  if (item != "") {
    indexLocal += "."+item;
    e.innerHTML += "<li class='w3-padding-small' id='tree-" + indexLocal.replace(/data\.index\./,"").replace(/\./g,"/") + "' onclick='CT.loadPage(\"" + indexLocal.replace(/data\.index\./,"").replace(/\./g,"/") + "\");'>" + level + item + "</li>";
  }

  //Only build if there are subnodes
  if (Object.keys(eval(indexLocal)).length !== 0) {

    //Build each subnode by recursion.
    for (var next in eval(indexLocal)) {
      CT.buildTreeHelper(e, indexLocal, next, level+"&nbsp;&nbsp;");
    }
  }
}

CT.isPage = function(page) {
  var partialAddress = "data.index";
  var ary = page.split(/\//g);

  //Loop over all of the parent names.
  for (var i = 0; i < ary.length; i++) {

    //If we don't have this node in the Index then add it.
    if (!eval(partialAddress+".hasOwnProperty(ary[i])")) {
      return false;
    } else { //Otherwise move to the next node.
      partialAddress += "." + ary[i];
    }
  }

  return true;
}

//Used to load a page (skipsaved for initial load.)
CT.loadPage = function(page, skipsave, skipback) {
  var from = data.selected;

  //Save the current page if Journal
  if ((data.display == "Journal") && (!skipsave)) {
    Journal.savePage();
  }

  //Check the landing page exists.
  if (!data.pages.hasOwnProperty(page)) {
    //If we are linking to a null page then default to the journal.
    CT.changeDisplay("Journal");
  //If currently viewing a map and another page is loaded without a map then switch to the journal.
  } else if ((data.display == "Map") && (!data.pages[page].hasOwnProperty('map'))) {
    CT.changeDisplay("Journal");
  } else if ((data.display == "Journal") && (!data.pages[page].hasOwnProperty('content')) && (data.pages[page].hasOwnProperty('map'))) {
    CT.changeDisplay("Map");
  }

  if (data.display == "Journal") {
    data.selected = page;
    Journal.loadPage(page);
  } else if (data.display == "Map") {
    if ((page != "") && (data.display == "Map") && (data.pages[page].hasOwnProperty('map'))) {
      data.selected = page;
      //If there is a global leaflet map then remove it.
      if  (Map.hasOwnProperty('lmap')) { Map.lmap.remove() };
      Map.createLMap();
    }

  }

  //Change highlight in tree to selected page.
  if (from != "") {
    document.getElementById('tree-'+from).classList.remove("w3-theme-l3");
  }
  if (page != "") {
    document.getElementById('tree-'+page).classList.add("w3-theme-l3");
  }

  //Change the page title display.
  document.getElementById('ctPageTitle').innerHTML = "<i>" + page + "</i>&nbsp;<a class='w3-bar-item w3-button w3-padding-small fa fa-edit' href='javascript:CT.pagePropertiesModal()'' title='Edit Properties'>";

  //Save back button info.
  if (!skipback) {CT.saveBackInfo();}
}

CT.isEmpty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return (JSON.stringify(obj) === JSON.stringify({}));
}

CT.saveBackInfo = function(keepFuture) {
  //If history doesn't exist then create.
  if (!data.hasOwnProperty("history")) {
    data.history = [];
  }

  //While there are more than 20 things in the history.
  while (data.history.length >= 20) {
    data.history.shift();
  }

  //Also remove any forward info as it doesn't make sense anymore since we are saving a new page.
  if (!keepFuture) data.future = [];

  //Do not allow null to enter the backlog.
  if (data.display == "") return;
  if (data.selected == "") return;

  data.history.push([data.display,data.selected]);
}

CT.goBack = function() {
  //Only allow going back if there is history to go back to.
  if (data.history.length > 0) {
    var next = data.history.pop();
    data.future.push([data.display,data.selected]);
    //If we are on the page we would back to go again.
    if ((data.display == next[0]) && (data.selected == next[1]) && (data.history.length > 0)) {
      next = data.history.pop();
    }
    CT.changeDisplay(next[0], false, true);
    CT.loadPage(next[1], false, true);
  }
}

CT.goForward = function() {
  //If the future property doesn't exist then create it.
  if (!data.hasOwnProperty("future")) {
    data.future = [];
  }

  //Only allow forward if there are future pages to go to.
  if (data.future.length > 0) {
    var next = data.future.pop();
    CT.saveBackInfo(true); //When going forward keep the future.
    CT.changeDisplay(next[0], false, true); //DO save the back info for the current page.
    CT.loadPage(next[1], false, true);
  }
}

CT.toggleCollapsed = function(id) {
  var element = document.getElementById(id);
  var title = document.getElementById('t-'+id);

  if (element.classList.contains('w3-hide')) {
    element.classList.remove('w3-hide');
    title.classList.remove('fa-plus');
    title.classList.add('fa-minus');
  } else {
    element.classList.add('w3-hide');
    title.classList.remove('fa-minus');
    title.classList.add('fa-plus');
  }
}

CT.deletePage = function() {
  var page = data.selected;
  data.selected = "";

  //Only work to do if there is a page to delete.
  if (data.pages.hasOwnProperty(page)) {
    delete data.pages[page];
    CT.removeIndex(page);
  }

  //Make sure that we rebuild the tree. And load a page if one exists.
  CT.buildTree();
  CT.filterTree({key: "Enter"},1);

  //Since this is called from the modal make sure that we close that!
  document.getElementById('ppModal').style.display = "none";
}

CT.ynModalCallback = function(val) {
  //Make the modal invisible.
  document.getElementById('ynModal').style.display = "none";

  //Just make sure that this is available. If it isn't a function then there is a development problem.
  if (CT.hasOwnProperty('ynCallback')) {
    CT.ynCallback(val);
  }
}

CT.ynModal = function(header, question, callback) {
  //Save the callback function
  CT.ynCallback = callback;

  //Update the header and the question
  document.getElementById('ynHeader').innerHTML = header;
  document.getElementById('ynQuestion').innerHTML = question;

  //Make visible
  document.getElementById('ynModal').style.display = "block";
}

CT.tempModalOpen = function(id) {
  document.getElementById(id).style.display = 'block';
}

CT.testAlert = function(val) {
  alert(val);
}
