/*
  Handle map creation and display tools.

  Author: HAJ523
  2019-03 Created.
*/

var MR = {};
MR.PS = 8; //Default font size. Variable until the best size is determined.
MR.BR = 10; //Border size.

/*
  Scope:
  Description:
*/
MR.setMapSize = function(p, w, h) {
  //Update the page by creating, trimming, Or expanding the arrays.
  if data.pages[p].hasOwnProperty("M") {
    //If the width is less then trim the
    if (w < data.pages[p].M.W) {

    }

  } else {
    data.pages[p].M = {}; //Create the map

    data.pages[p].M.W = w;
    data.pages[p].M.H = h;

    //Create the arrays.
    data.pages[p].M.A = new Array(w);
    data.pages[p].M.A.map(function(e, i) {
      data.pages[p].M.A[i] = new Array(h);
    });

  }

  //Update the Canvas
  var canvas = document.getElementById("MapCanvas");
  canvas.width = w * MR.PS + MR.BR*2; //Add 10px on all sides of the display.
  canvas.height = h * MR.PS + MR.BR*2;
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
