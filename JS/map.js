var Map = {};
Map.markers = {};
Map.PartyIcon = L.divIcon({
  className: "PartyIcon",
  iconAnchor: [0,24],
  labelAnchor: [-6,0],
  popupAnchor: [0,-36],
  html: '<span style="background-color: #0FF;width: 3rem;height: 3rem;display: block;left: -1.5rem;top: -1.5rem;position: relative;border-radius: 3rem 3rem 0;transform: rotate(45deg);border: 1px solid #FFF"/>'
});
Map.GenericIcon = L.divIcon({
  className: "GenericIcon",
  iconAnchor: [0,24],
  labelAnchor: [-6,0],
  popupAnchor: [0,-36],
  html: '<span style="background-color: #CCC;width: 3rem;height: 3rem;display: block;left: -1.5rem;top: -1.5rem;position: relative;border-radius: 3rem 3rem 0;transform: rotate(45deg);border: 1px solid #FFF"/>'
});

Map.createLMap = function() {
  //Make sure that there is something to display or quit.
  if (!data.pages[data.selected].hasOwnProperty('map')) {
    document.getElementById('MapText').classList.remove('w3-hide');
    return;
  }

  document.getElementById('MapText').classList.add('w3-hide');

  Map.lmap = L.map('LeafletDiv', {crs: L.CRS.Simple, measureControl:true, minZoom:0, maxZoom:5});
  if (!data.pages[data.selected].map.hasOwnProperty('bounds')) {
    data.pages[data.selected].map.bounds = [[0,0],[10,10]];
  }
  var mapLink = '<a href="javascript:void(0);">Help</a>'; //TODO Add map help clickable!
  var image = L.imageOverlay(data.pages[data.selected].map.image,data.pages[data.selected].map.bounds,{attribution: mapLink}).addTo(Map.lmap);
  if (data.pages[data.selected].map.hasOwnProperty('displayBounds')) {
    Map.lmap.fitBounds(data.pages[data.selected].map.displayBounds);
  } else {
    Map.lmap.fitBounds(data.pages[data.selected].map.bounds);
  }
  Map.lmap.doubleClickZoom.disable();
  Map.lmap.on('move', Map.mapMoveOrZoom);
  Map.lmap.on('zoom', Map.mapMoveOrZoom);

  Map.markers = {};  //Destroy the old maps marker references.
  //Add Existing markers:
  if (!CT.isEmpty(data.pages[data.selected].map.markers)) {
    for (var markID in data.pages[data.selected].map.markers) {
      Map.markers[markID] = new L.marker(data.pages[data.selected].map.markers[markID], {icon: Map.GenericIcon}).addTo(Map.lmap);
      Map.markers[markID].dragging.enable();
      Map.markers[markID].on('dblclick', Map.markerClick);
      Map.markers[markID].on('move', Map.markerMove);
      Map.markers[markID]._icon.id = markID;
    }
  }

  //Add event listeners:
  Map.lmap.on('dblclick',Map.addMapMarker);
}

//TODO Consider Remove / Update
Map.updateDisplay = function() {
  //If there is a selected image don't display the image choose input.
  if (data.pages[data.selected].hasOwnProperty('map')) {
    document.getElementById('aMap').style.display = "none";
  } else {
    document.getElementById('aMap').removeAttribute('style');
  }
}

Map.chooseMapFile = function() {
  document.getElementById('ppMapFile').dispatchEvent(new MouseEvent('click'));
}

Map.loadMapFile = function(e) {
  var file = e.target.files[0];

  //If no file selected the quit.
  if (!file) {
    return;
  }

  //If file not an image then quit.
  if (!file.type.match('image.*')) {
    return;
  }

  data.temp = {}; //Make sure that there is no data in temp. Or that it gets reset.
  data.temp.name = file.name; //Should in theory get the image name.
  if (data.temp.name !="") document.getElementById('ppMapFileDisplay').innerHTML = data.temp.name;

  var reader = new FileReader();
  reader.onload = function(e) {
    data.temp.image = e.target.result; //Save to temporary location until the save button is clicked.
  };
  reader.readAsDataURL(file);
}

Map.addMapMarker = function(e) {
  var markID = CT.tempID(8);
  Map.markers[markID] = new L.marker(e.latlng, {icon: Map.PartyIcon}).addTo(Map.lmap);
  Map.markers[markID].dragging.enable();
  Map.markers[markID].on('dblclick', Map.markerClick);
  Map.markers[markID].on('move', Map.markerMove);
  Map.markers[markID]._icon.id = markID
  data.pages[data.selected].map.markers[markID] = e.latlng;
}

Map.markerClick = function(e) {
  //If we double clicked with alt pressed then open the edit for this marker. Or if the marker doesn't have a link.
  if (Keyboard.KMap['Alt'] || (!data.pages[data.selected].map.markers[e.target._icon.id].hasOwnProperty('link'))) {
    CT.markerModal(e.target._icon.id);
  } else {
    //There must be a linked page to zoom to.
    CT.loadPage(data.pages[data.selected].map.markers[e.target._icon.id].link);
  }
}

Map.markerMove = function(e) {
  data.pages[data.selected].map.markers[e.target._icon.id] = e.latlng;
}

Map.mapMoveOrZoom = function(e) {
  data.pages[data.selected].map.displayBounds = e.target.getBounds();
}
