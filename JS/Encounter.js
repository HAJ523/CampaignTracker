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

EN.copyOC = function() {

}

EN.removeOC = function() {

}

EN.addEffect = function() {
  var effType = document.getElementById('OCEFType').value;
  if (effType=="0") {return;} //If no effect type is selected then quit.

  EN.updateEffectTypeDisplay(effType,"0"); //Reset to beginning display.

}

EN.removeEffect = function() {

}

EN.updateEffectShapeDisplay = function(o,n) {
  var elShapeDisp = document.getElementById('OCEFShapeDisp');
  switch(o) {
    case "0":
      elShapeDisp.classList.remove("fa-shapes");
      break;
    case "1":
      elShapeDisp.classList.remove("fa-circle");
      break;
    case "2":
      elShapeDisp.classList.remove("fa-square");
      break;
    }

  switch(n) {
    case "0":
      elShapeDisp.classList.add("fa-shapes");
      break;
    case "1":
      elShapeDisp.classList.add("fa-circle");
      break;
    case "2":
      elShapeDisp.classList.add("fa-square");
      break;
  }
}

EN.slctEffShape = function(n) {
  var elEffShape = document.getElementById('OCEFShape');
  EN.updateEffectShapeDisplay(elEffShape.value,n);
  elEffShape.value = n;

  //Update the sizing element display.
  var el = document.getElementById("OCEFSize")
  switch(n) {
    case "1":
      el.title = "Radius";
      el.placeholder = "Rad";
      break;
    case "2":
      el.title = "Size";
      el.placeholder = "Size";
  }
}

EN.updateEffectTypeDisplay = function(o,n) {
  var elTypeDisp = document.getElementById('OCEFTypeDisp');
  switch(o) {
    case "0":
      elTypeDisp.classList.remove("fas","fa-hat-wizard");
      break;
    case "1":
      elTypeDisp.classList.remove("far","fa-lightbulb");
      break;
    case "2":
      elTypeDisp.classList.remove("fas","fa-lightbulb");
      break;
    case "3":
      elTypeDisp.classList.remove("fas","fa-cloud");
      break;
    case "4":
      elTypeDisp.classList.remove("fas","fa-walking");
      break;
  }

  switch(n) {
    case "0":
      elTypeDisp.classList.add("fas","fa-hat-wizard");
      break;
    case "1":
      elTypeDisp.classList.add("far","fa-lightbulb");
      break;
    case "2":
      elTypeDisp.classList.add("fas","fa-lightbulb");
      break;
    case "3":
      elTypeDisp.classList.add("fas","fa-cloud");
      break;
    case "4":
      elTypeDisp.classList.add("fas","fa-walking");
      break;
  }
}

EN.slctEffType = function(n) {
  var elEffType = document.getElementById('OCEFType');
  EN.updateEffectTypeDisplay(elEffType.value,n);
  elEffType.value = n;
}

EN.updateEffectInnerDisplay = function(id,pre,n) {
  document.getElementById(id).innerHTML = document.getElementById(pre+n).innerHTML;
}

EN.slctEffOcc = function(n) {
  document.getElementById('OCEFOcc').value = n;
  EN.updateEffectInnerDisplay("EffectOcclusion","EfO",n);
}

EN.slctEffWalk = function(n) {
  document.getElementById('OCEFWalk').value = n;
  EN.updateEffectInnerDisplay("EffectWalkable","EfW",n);
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
