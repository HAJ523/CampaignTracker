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
    canvas.width = w * MR.PS + MR.BR*2; //Add 10px on all sides of the display.
    canvas.height = h * MR.PS + MR.BR*2;

    //TODO Call update view function to draw to canvas.
  }
}

/*
  Scope: Public
  Description: Re-draw everything to the canvas.
*/
MR.updateMapCanvas = function() {

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
