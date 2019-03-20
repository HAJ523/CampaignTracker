/*
  Handle map creation and display tools.

  Author: HAJ523
  2019-03 Created.
*/

var MR = {};
MR.FS = 8; //Default font size. Variable until the best size is determined. in Pixels.
MR.BR = 10; //Border size.
MR.ZM = 1;
MR.MD = false;
MR.PL = []; //Palette should be empty.
MR.PN = ""; //Current Palette name.

/*
  Scope: Public
  Description: Any setup needed for the mapper to function after page has loaded.
*/
MR.onLoad = function() {
  MR.CV = document.getElementById('MapCanvas');
  MR.CT = MR.CV.getContext("2d");
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
      data.pages[p].M.A.length = w;
      forceupdate = 1;
    }

    //If the height is less then trim the heights.
    if (h < data.pages[p].M.H) {
      data.pages[p].M.A.map(function(c,i) {
        //Only trim them if they have a length greater than the limit since they are sparse arrays.
        if (data.pages[p].M.A[i].length > h) {
          data.pages[p].M.A[i].length = h;
          forceupdate = 1;
        }
      });
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
    data.pages[p].M.A = [];
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
  MR.CT.fillStyle = data.pages[data.slctPage].M.C;
  MR.CT.fillRect(0,0,MR.CV.width, MR.CV.height);

  //Setup the font for printing to the canvas.
  MR.CT.font = MR.FS + "px Square";
  MR.CT.textAlign = "left";
  MR.CT.textBaseline = "top";

  var tile;
  for( var i = 0; i < data.pages[data.slctPage].M.W; i++) {
    for (var j = 0; j < data.pages[data.slctPage].M.H; j++) {
      //Check to make sure that this column exists then the row entry.
      if (data.pages[data.slctPage].M.A.hasOwnProperty(i)) {
        if (data.pages[data.slctPage].M.A[i].hasOwnProperty(j)) {
          tile = data.pages[data.slctPage].M.A[i][j];
          if (tile == null) { continue; } //If there is nothign to draw move on.

          MR.CT.fillStyle = tile.C;
          MR.CT.fillText(tile.S, MR.BR + i * MR.FS, MR.BR + j * MR.FS);
        }
      }
    }
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
    MR.CV.addEventListener('mousemove', MR.draw); //Add the move listener.
    //Draw to current location
    MR.addPointToDrawList(MR.mouseToMapLoc(e.offsetX, e.offsetY));
    //TODO undo list
  } else {
    MR.CV.removeEventListener('mousemove', MR.draw); //Remove the move listener.
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
    MR.CV.removeEventListener('mousemove', MR.draw);
    MR.MD = false; //Make sure that we stop drawing!
  }
}

/*
  Scope: Restricted (Mapper.js)
  Description: Add element to current draw list.
*/
MR.addPointToDrawList = function(loc) {
  //Make sure that there is a draw list.
  if (!MR.hasOwnProperty("CD")) {
    MR.CD = [];
  }
  switch(MR.CT) { //TODO update MR.DL list of points to be drawn to and display for each tool.
    case "L":
      if (MR.CD.length > 1) {
        MR.CD[1] = loc;
      } else {
        MR.CD.push(loc);
      }
      break;
    case "F":
      MR.CD[0] = loc;
      break;
    case "B":
    default:
      MR.CD.push(loc);
  }



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
  Description: Change the selected tool.
*/
MR.selectTool = function(t) {//Tool Selected
  if (MR.CT != undefined) {
    document.getElementById("tool" + MR.CT).classList.remove("w3-btn-pressed");
  }
  MR.CT = t;
  document.getElementById("tool" + t).classList.add("w3-btn-pressed");
}
