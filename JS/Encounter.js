/*
  Encounter map halding, lighting, vision.

  Author: HAJ523
  2019-04 Created.
*/

var EN = {};

EN.initEncounter = function() {
  if (!data.pages[data.slctPage].hasOwnProperty("E")) {
    data.pages[data.slctPage].E = {F:{}};
    //TODO add individual vs team fog of war init.
    data.pages[data.slctPage].E.F.P = {};
    data.pages[data.slctPage].E.F.M = {};
  }
}

EN.addOC = function() {

}

EN.updateEncounterCanvas = function() {
  //Update the layers based on current object properties.
  //Occlusion
  //Light
    //If r*3 < map perimeter use circle with distance radius for outside points instead of perimeter points!
  //Walkable
  //Update the display based on the layers

}
