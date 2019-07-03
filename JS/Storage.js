/*
  Storage functions for local or exported data.

  Author: HAJ523
  2019-01 Created.
*/

var ST = {}; //Initialize markdown object.

ST.onLoad = function() {
  ST.setupDatabase();
}

/*
  Scope: Public
  Description: Makes connection to IndexedDB for future save or load.
*/
ST.setupDatabase = function() {
  //Confirm that indexedDB is available.
  if (!('indexedDB' in window)) {
    CT.setStatus('Browser does not support IndexedDB.');
    return;
  }

  //Open a new request.
  var request = window.indexedDB.open('CampaignTracker',1);
  request.onerror = function(e) {
    CT.setStatus("Database error code: "+e.target.errorCode);
  };
  request.onsuccess = function(e) {
    ST.db = request.result;
    CT.setStatus("Database opened successfully");
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
    CT.setStatus("No database available for storage.");
    return;
  }

  var tx = ST.db.transaction("Campaigns","readwrite");
  var os = tx.objectStore("Campaigns");
  var rq = os.put(data);
  rq.onsuccess = function(e) {
    CT.setStatus(data.settings.name+" written to indexDB successfully");
  };
}

ST.loadData = function(name) {
  if (ST.db == null) {
    CT.setStatus("No database available for storage.");
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

    CT.finishLoad(slctViewFuture);
  };
}

/*
  Scope: Public //TODO get this to return values...
  Description: Returns a list of campaigns for use in loading.
*/
ST.listCampaigns = function() {
  if (ST.db == null) {
    CT.setStatus("No database available for storage.");
    return "";
  }

  var tx = ST.db.transaction("Campaigns","readonly");
  var os = tx.objectStore("Campaigns");

  return os.indexNames;
}
