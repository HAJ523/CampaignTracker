/*
  Handle map creation and display tools.

  Author: HAJ523
  2019-03 Created.
*/

var MR = {};
MR.PS = 8; //Default font size. Variable until the best size is determined.
MR.BR = 10; //Border size.

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

    //TODO Call update view function to draw to canvas.
  }
}

/*
  Scope: Public
  Description: Re-draw everything to the canvas.
*/
MR.updateMapCanvas = function() {
  var cvs = document.getElementById('MapCanvas');
  var ctx = cvs.getContext("2d");
  //Clear the canvas and reset the dimensions.
  cvs.width = data.pages[data.slctPage].M.W * MR.PS + MR.BR*2; //Add 10px on all sides of the display.
  cvs.height = data.pages[data.slctPage].M.H * MR.PS + MR.BR*2;

  //Draw the background first
  ctx.fillStyle = data.pages[data.slctPage].M.C;
  ctx.fillRect(0,0,cvs.width, cvs.height);

  //Setup the font for printing to the canvas.
  ctx.font = MR.PS + "px Square";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  var tile;
  for( var i = 0; i < data.pages[data.slctPage].M.W; i++) {
    for (var j = 0; j < data.pages[data.slctPage].M.H; j++) {
      tile = data.pages[data.slctPage].M.A[i][j];
      if (tile == null) { continue; } //If there is nothign to draw move on.

      ctx.fillStyle = tile.C;
      ctx.fillText(tile.S, MR.BR + i * MR.PS, MR.BR + j * MR.PS);
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
  if ((x > MR.BR + data.pages[data.slctPage].M.W * MR.PS) || (y > MR.BR + data.pages[data.slctPage].M.W * MR.PS)) { return null; }
  //Return the map location.
  return [Math.floor((x-MR.BR)/MR.PS),Math.floor((y-MR.BR)/MR.PS)];
}
