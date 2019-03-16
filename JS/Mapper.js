/*
  Handle map creation and display tools.

  Author: HAJ523
  2019-03 Created.
*/

var MR = {};
MR.PS = 8; //Default font size. Variable until the best size is determined.

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
  canvas.width = w * MR.PS + 20; //Add 10px on all sides of the display.
  canvas.height = h * MR.PS + 20;
}
