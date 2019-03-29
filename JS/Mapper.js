/*
  Handle map creation and display tools.

  Author: HAJ523
  2019-03 Created.
*/

var MR = {};
MR.FS = 12; //Default font size. Variable until the best size is determined. in Pixels.
MR.BR = 10; //Border size.
MR.ZM = 1;
MR.MD = false;
MR.PL = []; //Palette should be empty.
MR.PN = ""; //Current Palette name.
MR.brushSizesSquare = {S:[[0,0]], M:[[1,0],[1,1],[1,-1],[0,1],[0,-1],[-1,0],[-1,-1],[-1,1]], L:[[2,2],[2,1],[2,0],[2,-1],[2,-2],[1,2],[1,-2],[0,2],[0,-2],[-1,2],[-1,-2],[-2,2],[-2,1],[-2,0],[-2,-1],[-2,-2]]};
MR.brushSizesHex = {};

/*
  Scope: Public
  Description: Any setup needed for the mapper to function after page has loaded.
*/
MR.onLoad = function() {
  MR.CV = document.getElementById('MapCanvas');
  MR.CX = MR.CV.getContext("2d");
}

/*
  Scope: Public
  Description: Called when switching to map view.
*/
MR.initMapper = function() {
  MR.PL = [{T:".", C:"#FFFFFF", L:0, O:0.0, W:true}] //Default palette
  MR.slctTile = 0;
  MR.PN = "";
  MR.MD = false;
  MR.UNDO = [];

  //Start with the correct tool and layer selected.
  MR.selectTool("B");
  MR.selectLayer("T");
  MR.selectSize("S");

  //Build the HTML of the pallette.
  MR.buildHTMLPalette();
  MR.selectTile(null, 0);

  MR.updateMapCanvas();
  MR.CV.addEventListener("mousedown",MR.mouseChange);
  MR.CV.addEventListener("mouseup",MR.mouseChange);
  MR.CV.addEventListener("mouseout", MR.mouseOut);
}

/*
  Scope: Restricted
  Description: Change the size of the map.
*/
MR.setMapDetails = function(p, w, h, c) { //Page, Width, Height, Color
  var forceupdate = 0;
  //Update the page by creating, trimming, Or expanding the arrays.
  if (data.pages[p].hasOwnProperty("M")) {
    //If the width is less then trim the array.
    if (w < data.pages[p].M.W) {
      forceupdate = 1;
    }

    //If the height is less then trim the heights.
    if (h < data.pages[p].M.H) {
      forceupdate = 1;
    }

    //If we trimmed the height or width the loop over the keys and look for bad elements.
    if (forceupdate) {
      for (var t in data.pages[p].M.A) {
        //square
        var temp = t.split(",");
        if (parseInt(temp[0]) >= w) {delete data.pages[p].M.A[t]; continue;}
        if (parseInt(temp[1]) >= h) {delete data.pages[p].M.A[t];}
      }
    }

    //If we are adding then we also need to force an update but no changes to the arrays necesary.
    if ((h > data.pages[p].M.H) || w > data.pages[p].M.W) {
      forceupdate=1;
    }
  } else {
    data.pages[p].M = {}; //Create the map

    data.pages[p].M.W = w;
    data.pages[p].M.H = h;
    data.pages[p].M.C = c;

    //Create the sparse array.
    data.pages[p].M.A = {};
    forceupdate = 1; //Always redraw with new.
  }

  //Update the Canvas
  if (forceupdate) {
    var canvas = document.getElementById("MapCanvas");
    MR.updateMapCanvas();
  }
}

/*
  Scope: Public
  Description: Re-draw everything to the canvas.
*/
MR.updateMapCanvas = function() {
  //Clear the canvas and reset the dimensions.
  MR.CV.width = data.pages[data.slctPage].M.W * MR.FS + MR.BR*2; //Add 10px on all sides of the display.
  MR.CV.height = data.pages[data.slctPage].M.H * MR.FS + MR.BR*2;

  //Draw the background first
  MR.CX.fillStyle = data.pages[data.slctPage].M.C;
  MR.CX.fillRect(0,0,MR.CV.width, MR.CV.height);

  //Setup the font for printing to the canvas.
  MR.CX.font = MR.FS + "px Square";
  MR.CX.textAlign = "left";
  MR.CX.textBaseline = "top";

  var tile;
  for( var i = 0; i < data.pages[data.slctPage].M.W; i++) {
    if (!data.pages[data.slctPage].M.A.hasOwnProperty(i)) {continue;} //Skip the entire row if it doesn't exist.
    for (var j = 0; j < data.pages[data.slctPage].M.H; j++) {
      //Check to make sure that this column exists then the row entry.
      MR.printTile([i,j],i+","+j);
    }
  }
}

/*
  Scope: Public
  Description: Print a single tile to the canvas.
*/
MR.printTile = function(loc, t) {//Location, TileAddress
  if (data.pages[data.slctPage].M.A.hasOwnProperty(t)) {

    tile = data.pages[data.slctPage].M.A[t];
    if (tile == null) { return; } //If there is nothing to draw move on.

    //square drawing.
    var x = MR.BR + loc[0] * MR.FS;
    var y = MR.BR + loc[1] * MR.FS;

    MR.CX.fillStyle = data.pages[data.slctPage].M.C;
    MR.CX.fillRect(x, y, MR.FS, MR.FS);

    MR.CX.fillStyle = tile.C;
    MR.CX.fillText(tile.T, x, y);
  }
}

/*
  Scope: Public
  Description: Returns the map location coordinates of the canvas coordinates.
*/
MR.mouseToMapLoc = function(x, y) {
  //If the click is in the border then there is nothing to return!
  if ((x < MR.BR) || (y < MR.BR)) { return null; }
  if ((x > MR.BR + data.pages[data.slctPage].M.W * MR.FS) || (y > MR.BR + data.pages[data.slctPage].M.W * MR.FS)) { return null; }
  //Return the map location.
  return [Math.floor((x-MR.BR)/MR.FS),Math.floor((y-MR.BR)/MR.FS)];
}

/*
  Scope: Public
  Description: Handle mouse actions on canvas.
*/
MR.mouseChange = function(e) {
  MR.MD = (e.type == "mousedown"); //Prevent problems with draging outside canvas.

  if (MR.MD) {
    console.log("d");
    //Setup the undo array. by adding new object to beginning.
    MR.UNDO.unshift({});
    if (MR.UNDO.length > 20) {
      MR.UNDO.pop();
    }

    MR.CV.addEventListener('mousemove', MR.mouseMove); //Add the move listener.
    //Draw to current location
    MR.mouseMove(e);
    //TODO undo list
  } else {
    MR.CV.removeEventListener('mousemove', MR.mouseMove); //Remove the move listener.
    if (!MR.hasOwnProperty("CD")) return;

    switch (MR.CT) { //TODO Add more tools here.
      case "B":
      default:
        break;
    }
  }
}

MR.mouseOut = function(e) {
  if (MR.MD) {
    MR.CV.removeEventListener('mousemove', MR.mouseMove);
    MR.MD = false; //Make sure that we stop drawing!
  }
}

MR.mouseMove = function(e) {
  var rect = e.target.getBoundingClientRect();
  var loc = MR.mouseToMapLoc(e.clientX - rect.left, e.clientY - rect.top);

  MR.drawPoint(loc);
}

MR.drawPoint = function(loc) {
  if (loc == null) {return;} //If loc isn't populated then there is nothing to do!
  if ((MR.hasOwnProperty('LL')) && (loc[0] == MR.LL[0]) && (loc[1] == MR.LL[1])) {return;} //If there was no movement then quit.
  MR.LL = loc; //Update the previous loc.
  switch(MR.CT) {
    case "B":
      //Repaint the canvas at that location with the new tile.
      switch(MR.TS) {
        case "L":
          MR.brushPoint(loc,"L");
        case "M":
          MR.brushPoint(loc,"M");
        case "S":
        default:
          MR.brushPoint(loc,"S");
      }
      break;
  }
}

/*
  Scope: Private
  Description: paint all tiles in the brush location.
*/
MR.brushPoint = function(loc, s) {//Location, Size
  var x=0;
  var y=0;
  var t;

  //Loop over the brush and paint tiles.
  for(var i=0;i<MR.brushSizesSquare[s].length;i++) {
    //Brush bristle location.
    x = loc[0]+MR.brushSizesSquare[s][i][0];
    y = loc[1]+MR.brushSizesSquare[s][i][1];
    t = x+","+y;

    //Check to make sure the bristle is on the map!
    if (x < 0) {continue;}
    if (x >= data.pages[data.slctPage].M.W) {continue;}
    if (y < 0) {continue;}
    if (y >= data.pages[data.slctPage].M.H) {continue;}

    //Add new tile to the undo if it isn't there already
    if (MR.UNDO[0].hasOwnProperty(t)) {continue;}
    MR.UNDO[0][t] = data.pages[data.slctPage].M.A[t];

    MR.setMapTile([x,y], t);
  }
}

MR.setMapTile = function(loc, t) {
  //Choose a random tile from the palette.
  data.pages[data.slctPage].M.A[t] = MR.PL[Math.floor(Math.random()*MR.PL.length)];

  MR.printTile(loc, t);
}

/*
  Scope: Public
  Description: Used to clear any undo / selection data when changing pages.
*/
MR.clearMapper = function() {
  MR.CT = "B"; //Default to the brush.
  delete MR.CD; //Delete any current drawing operations.
  MR.ZM = 1; //Set the zoom scale back to 1.
}

/*
  Scope: Public
  Description: Select the tool size for brushes and lines.
*/
MR.selectSize = function(s) {
  document.getElementById('toolB').innerHTML = document.getElementById('size'+s).innerHTML;
  MR.TS = s;
}

/*
  Scope: Public
  Description: Change the selected tool.
*/
MR.selectTool = function(t) {//Tool Selected
  if (MR.CT != undefined) {
    document.getElementById("tool" + MR.CT).classList.remove("w3-btn-pressed");
  }
  MR.CT = t;
  document.getElementById("tool" + t).classList.add("w3-btn-pressed");
}

/*
  Scope: Public
  Description: Select the layer for display.
*/
MR.selectLayer = function(l) { //Layer
  if (MR.LY != undefined) {
    document.getElementById("layer" + MR.LY).classList.remove("w3-btn-pressed");
  }
  MR.LY = l;
  document.getElementById('layer' + l).classList.add("w3-btn-pressed");

  //TODO Update the entire canvas display to show new layer information!
}

MR.incTileLight = function() {
  switch(MR.PL[MR.slctTile].L) {
    case 0:
    case 1:
      MR.selectTileLight(MR.PL[MR.slctTile].L+1);
      break;
    case 2:
    default:
      MR.selectTileLight(0);
  }
}

MR.incTileOcclusion = function() {
  switch(MR.PL[MR.slctTile].O) {
    case 0:
    case 0.125:
    case 0.75:
    case 0.875:
      MR.selectTileOcclusion(MR.PL[MR.slctTile].O+.125);
      break;
    case 0.25:
    case 0.5:
      MR.selectTileOcclusion(MR.PL[MR.slctTile].O+.25);
      break;
    case 1:
    default:
      MR.selectTileOcclusion(0);
  }
}

/*
  Scope: Public
  Description: Set the light on the current title and update the display.
*/
MR.selectTileLight = function(l) {//Lighting
  MR.PL[MR.slctTile].L = l;
  MR.setLightGui();
}

/*
  Scope: Public
  Description Set the occlusion on the current tile and update the display.
*/
MR.selectTileOcclusion = function(o, v) {//Occlusion, HTML Value
  MR.PL[MR.slctTile].O = o;
  MR.setOcclusionGui();
}

/*
  Scope: Public
  Description: Change the walkable status of a tile!
*/
MR.selectTileWalkable = function() {
  MR.PL[MR.slctTile].W = !MR.PL[MR.slctTile].W;
  MR.setWalkableGui();
}

MR.buildHTMLPalette = function() {
  //Loop over all the tiles.
  for(var i = 0; i < MR.PL.length; i++) {
    MR.addHTMLTileToPalette(i);
  }
}

MR.addHTMLTileToPalette = function(i) {
  var el = document.getElementById('paletteDisplay');
  el.innerHTML += '<span onclick="javascript:MR.selectTile(this);" style="background: ' + data.pages[data.slctPage].M.C + '; color: '+MR.PL[i].C+'">' + MR.PL[i].T + '</span>';
}

MR.remHTMLTileFromPalette = function(i) {
  var el = document.getElementById('paletteDisplay');
  el.removeChild(el.children[i]);
}

MR.selectTile = function(e, i) {
  if ((i==null)||(i==undefined)) {i=0;}
  if (e!= null){while( (e = e.previousSibling) != null )  { i++;}} //Figure out index.
  e = document.getElementById('paletteDisplay');
  e.children[MR.slctTile].classList.remove('selected');
  MR.slctTile = i;
  e.children[i].classList.add('selected');
  //Now update the tile editing controls.
  document.getElementById('Tile').value = MR.PL[MR.slctTile].T;
  document.getElementById('TileColor').value = MR.PL[MR.slctTile].C;
  MR.setWalkableGui();
  MR.setLightGui();
  MR.setOcclusionGui();
}

MR.setWalkableGui = function() {
  var el = document.getElementById('TileWalkable');

  if ((MR.PL[MR.slctTile].W) && (!el.classList.contains('w3-btn-pressed'))) {
    el.classList.add('w3-btn-pressed');
    return; //Done so return.
  }
  if ((!MR.PL[MR.slctTile].W) && (el.classList.contains('w3-btn-pressed'))) {
    el.classList.remove('w3-btn-pressed');
  }
}

MR.setOcclusionGui = function() {
  document.getElementById('TileOcclusion').innerHTML = document.getElementById("Occ" + MR.PL[MR.slctTile].O).innerHTML;
}

MR.setLightGui = function() {
  document.getElementById('TileLight').innerHTML = document.getElementById("Light" + MR.PL[MR.slctTile].L).innerHTML;
}

/*
  Scope: CT3.html
  Description: Add a tile to the currently selected palette.
*/
MR.addTileToPalette = function() {
  MR.PL.push(Object.assign({},MR.PL[MR.slctTile]));
  MR.addHTMLTileToPalette(MR.PL.length-1);
  MR.selectTile(null, MR.PL.length-1);
}

MR.remTileFromPalette = function() {
  var i = MR.slctTile;
  MR.remHTMLTileFromPalette(i);
  MR.PL.splice(i,1);
  if (MR.slctTile >= MR.PL.length) {
    MR.selectTile(null, MR.PL.length-1);
  } else {
    MR.selectTile(null, MR.slctTile);
  }
}

//Update the display of the tile.
MR.updatePaletteTile = function() {
  var e = document.getElementById('paletteDisplay');
  MR.PL[MR.slctTile].T = document.getElementById('Tile').value;
  e.children[MR.slctTile].innerHTML = MR.PL[MR.slctTile].T;

  MR.PL[MR.slctTile].C = document.getElementById('TileColor').value;
  e.children[MR.slctTile].style.color = MR.PL[MR.slctTile].C;
}
