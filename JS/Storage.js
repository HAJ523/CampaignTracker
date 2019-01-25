/*
  Storage functions for local or exported data.

  Author: HAJ523
  2019-01 Created.
*/

var ST = {}; //Initialize markdown object.

ST.onload = function() {
  ST.setupDatabase();
}

/*
  Scope: Public
  Description: Makes connection to IndexedDB for future save or load.
*/
ST.setupDatabase = function() {
  //Confirm that indexedDB is available.
  if (!('indexedDB' in window)) {
    console.log('Browser does not support IndexedDB.');
    return;
  }

  //Open a new request.
  var request = window.indexedDB.open('CampaignTracker',1);
  request.onerror = function(e) {
    console.log("Database error code: "+e.target.errorCode);
  };
  request.onsuccess = function(e) {
    ST.db = request.result;
    console.log("Database opened successfully");
  };
  request.onupgradeneeded = function(e) {
    var campStore = e.currentTarget.result.createObjectStore("Campaigns",{keyPath: "settings.name"});
    var pageStore = e.currentTarget.result.createObjectStore("SharedPages", {keyPath: "id"});
  }
}

/*
  Scope: Public
  Description: Save the data object to the IndexedDB database.
*/
ST.saveData = function() {
  if (ST.db == null) {
    console.log("No database available for storage."); //TODO update to status
    return;
  }

  var tx = ST.db.transaction("Campaigns","readwrite");
  var os = tx.objectStore("Campaigns");
  var rq = os.put(data);
  rq.onsuccess = function(e) {
    console.log(data.settings.name+" written to indexDB successfully");
  };
}

ST.loadData = function(name) {
  if (ST.db == null) {
    console.log("No database available for storage.");
    return;
  }

  var tx = ST.db.transaction("Campaigns","readonly");
  var os = tx.objectStore("Campaigns");
  var rq = os.get(name);
  rq.onsuccess = function (e) {

    //Get the campaign data and make sure that we reset the view to what is
    //currently open before we allow the system to chagne the view back to what
    //was previously selected.
    var slctView = data.slctView;
    CT.resetData(); //TODO determine if this line is unnecessary
    data = e.currentTarget.result;
    var slctViewFuture = data.slctView;
    data.slctView = slctView;

    return [slctViewFuture];


    console.log(data.settings.name+"Campaign loaded from indexDB successfully");
  };
}
