/*
  Encounter map halding, lighting, vision.

  Author: HAJ523
  2019-04 Created.
*/

var EN = {};

EN.initEncounter = function() {
  //Add Event Listeners to the canvas.
}

EN.addOC = function() {

}

EN.updateOC = function() {
  
}

EN.removeOC = function() {

}

EN.initTempLayers = function() {
  //Create the objects.
  data.pages[data.slctPage].E.O = {};
  data.pages[data.slctPage].E.L = {};
  data.pages[data.slctPage].E.W = {};
  data.pages[data.slctPage].E.F = {}; //These arrays can be empty becuase no value is the same as not seen.
  data.pages[data.slctPage].E.F.P = {};
  data.pages[data.slctPage].E.F.M = {};

  //Loop through all keys
  for (var k in data.pages[data.slctPage].M.A) {
    data.pages[data.slctPage].E.O[k] = data.pages[data.slctPage].M.A[k].O
    data.pages[data.slctPage].E.L[k] = data.pages[data.slctPage].M.A[k].L
    data.pages[data.slctPage].E.W[k] = data.pages[data.slctPage].M.A[k].W
  }
}

EN.resetEncounterCanvas = function() {
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

  EN.updateEncounterCanvas();
}

EN.closeEncounter = function() {
  //Remove the event listeners to prevent conflict with mapper.
  //TODO Add event listeners.
}

EN.updateEncounterCanvas = function() {
  //Update the layers based on current object properties.
  //Occlusion
  //Light
    //If r*3 < map perimeter use circle with distance radius for outside points instead of perimeter points!
  //Walkable
  //Update the display based on the layers

}
