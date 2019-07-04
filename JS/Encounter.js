/*
  Encounter map halding, lighting, vision.

  Author: HAJ523
  2019-04 Created.
*/

var EN = {};

//list translations
EN.effType = {"1":"&#xf185;","2":"&#xf186","3":"&#xf0c2","4":"&#xf554;"};
EN.eShape = {"1":"&#xf111;","2":"&#xf0c8;"};
EN.eTerrain = {"0":"&#xf54b;",".5":"&#xf70c;","1":"&#xf554;","2":"&#xf6ec;"};
EN.eOcclusion = {"0":"0&#8260;1",".125":"1&#8260;8",".25":"1&#8260;4",".5":"1&#8260;2",".75":"3&#8260;4",".875":"7&#8260;8","1":"1&#8260;1"};

EN.onLoad = function() {
  EN.CV = document.getElementById('EncounterCanvas');
  EN.CX = EN.CV.getContext('2d');
}

EN.initEncounter = function() {
  //Add Event Listeners to the canvas.
  window.addEventListener("resize", EN.resizeHandler);

  //Make sure our data save architecture exists.
  if (!data.pages[data.slctPage].hasOwnProperty("E")) {
    data.pages[data.slctPage].E = {};
  }

  EN.Z = document.getElementById("ENZoom").value;

  //
  EN.initTempLayers();

  //Redraw the Encounter.
  EN.resetEncounterCanvas();
}

EN.closeEncounter = function() {
  //Remove the event listeners to prevent conflict with mapper.
  window.removeEventListener("resize", EN.resizeHandler);
  if (EN.timer != undefined) {
    clearTimeout(EN.timer);
    EN.timer = undefined;
  }
}


EN.resizeHandler = function() {
  if (EN.timer != undefined) {
    clearTimeout(EN.timer);
    EN.timer = undefined;
  }
  EN.timer = setTimeout(function() {
    EN.timer = undefined;
    EN.resizeCB();
  }, 1000); //Wait one second before redrawing to make sure that no more resize events will occur.
}

EN.resizeCB = function() {
  EN.resetEncounterCanvas();
}
EN.timer = undefined;

EN.addOC = function() {
  //Clear the object elements
  document.getElementById('OCID').value = CT.GUID(8);
  document.getElementById('OCName').value = "";
  document.getElementById('OCTile').value = "@";
  document.getElementById('OCColor').value="#FFFFFF";
  document.getElementById('OCType').value = "0";
  document.getElementById('OCVisible').value = "1";
  document.getElementById('OCSize').value = "1";
  document.getElementById('OCLoc').value = "";
  document.getElementById('OCBright').value = "";
  document.getElementById('OCDim').value = "";
  document.getElementById('OCDark').value = "";

  //Clear the Effect Inputs
  EN.clearEffectInput();

  //Clear the effects list.
  document.getElementById('OCEffectList').innerHTML="";



  //Now that there is an object make Effects Visible
  document.getElementById('Effects').classList.remove('w3-hide');
}

EN.clearEffectInput = function() {
  document.getElementById('OCEFType').value = "0";
  document.getElementById('OCEFShape').value = "0";
  document.getElementById('OCEFSize').value = "";
  document.getElementById('OCEFOcc').value = "-1";
  document.getElementById('OCEFTer').value = "-1";
}

EN.updateOC = function() {
  var id = document.getElementById('OCID').value;
  var obj = data.pages[data.slctPage].E.OC[obj];

  obj.N = document.getElementById('OCName').value;
  obj.Ti = document.getElementById('OCTile').value;
  obj.C = document.getElementById('OCColor').value;
  obj.Ty = document.getElementById('OCType').value;
  obj.V = document.getElementById('OCVisible').value;
  obj.S = document.getElementById('OCSize').value;
  obj.L = document.getElementById('OCLoc').value;
  obj.Vb = document.getElementById('OCBright').value;
  obj.Vd = document.getElementById('OCDim').value;
  obj.Vk = document.getElementById('OCDark').value;
}

EN.copyOC = function() {
  var obj = document.getElementById('OCID').value;

  //Now copy that object and effects into a new object.
}

EN.removeOC = function() {
  var obj = document.getElementById('OCID').value;

  //Delete
}

EN.addEffect = function() {
  var objid = document.getElementById('OCID').value;
  var obj = data.pages[data.slctPage].E.OC[objid];
  var effType = document.getElementById('OCEFType').value;
  if (effType=="0") {return;} //If no effect type is selected then quit.

  var id = CT.GUID(8); //Effect ID

  if (!obj.hasOwnProperty('Es')) { //Build the effect list if it doesn't exist.
    obj.Es = {};
  }

  //Add effect to object.
  obj.Es[id] = {};
  obj.Es[id].Ty = document.getElementById('OCEFType').value;
  obj.Es[id].Sh = document.getElementById('OCEFShape').value;
  obj.Es[id].Si = document.getElementById('OCEFSize').value;
  if (obj.Es[id].Ty == "3") {
    obj.Es[id].Oc = document.getElementById('OCEFOcc').value;
  } else if (obj.Es[id].Ty == "4") {
    obj.Es[id].Te = document.getElementById('OCEFTer').value;
  }



  //Add Effect to display list.
  document.getElementById('OCEffectList').innerHTML += '<div id="Eff' + id + '"><a href="javascript:EN.removeEffect(\'' + id + '\');" class="w3-btn w3-padding-small-square fas fa-minus-circle"></a> <i class="fas">'+EN.eType[obj.Es[id].Ty]+' '+EN.eShape[obj.Es[id].Sh]+'</i> <i class="fas fa-glasses"></i></span></div>';

  //Clear the Effect inputs.
  EN.clearEffectInput();
}

EN.changeType = function() {
  var type = document.getElementById('OCEFType').value;
  var cond1 = document.getElementById('OCEFOcc');
  var cond2 = document.getElementById('OCEFTer');

  switch(type) {
    case "1":
    case "2":
      cond1.classList.add("w3-hide");
      cond2.classList.add("w3-hide");
      break;
    case "3":
      cond1.classList.remove('w3-hide');
      cond2.classList.add('w3-hide');
      break;
    case "4":
      cond1.classList.add('w3-hide');
      cond2.classList.remove('w3-hide');
      break;
  }
}

EN.changeShape = function() {
  var el = document.getElementById('OCEFSize');
  var s = document.getElementById('OCEFShape').value;

  switch(s) {
    case "1":
      el.placeholder = "Rad";
      el.title = "Radius";
      break;
    default:
      el.placeholder = "Size";
      el.title="Size";
      break;
  }
}

EN.removeEffect = function() {

}

EN.initTempLayers = function() {
  //Create the objects.
  data.pages[data.slctPage].E.O = {}; //Occlusion
  data.pages[data.slctPage].E.L = {}; //Lighting
  data.pages[data.slctPage].E.W = {}; //Walking
  data.pages[data.slctPage].E.F = {}; //Fog of War //These arrays can be empty becuase no value is the same as not seen.
  data.pages[data.slctPage].E.F.P = {}; //Players
  data.pages[data.slctPage].E.F.M = {}; //Monsters

  //Loop through all keys and initialize arrays to Map values.
  for (var k in data.pages[data.slctPage].M.A) {
    data.pages[data.slctPage].E.O[k] = data.pages[data.slctPage].M.A[k].O
    data.pages[data.slctPage].E.L[k] = data.pages[data.slctPage].M.A[k].L
    data.pages[data.slctPage].E.W[k] = data.pages[data.slctPage].M.A[k].W
  }

  //Create Object & Creatures Arrays
  data.pages[data.slctPage].E.OC = {};

  //Setup default selection
  data.pages[data.slctPage].E.SC = {X:0,Y:0};
}

EN.resetEncounterCanvas = function() {
  //Clear the canvas and reset the dimensions.
  EN.CV.width = EN.CV.clientWidth;
  EN.CV.height = EN.CV.clientHeight;

  //Update to new center.
  EN.CP = {X:Math.floor(EN.CV.width/2),Y:Math.floor(EN.CV.height/2)};

  //Setup the font for printing to the canvas.
  EN.CX.font = EN.Z + "px Square";
  EN.CX.textAlign = "left";
  EN.CX.textBaseline = "top";

  EN.updateEncounterCanvas();
}

EN.updateEncounterCanvas = function() {
  //Redraw background to clear canvas.
  EN.CX.fillStyle = data.pages[data.slctPage].M.C;
  EN.CX.fillRect(0,0,EN.CV.width, EN.CV.height);
  //Draw center mark & Borders.
  EN.centerMark();
  //Update the layers based on current object properties.
  //Occlusion
  //Light
    //If r*3 < map perimeter use circle with distance radius for outside points instead of perimeter points!
  //Walkable
  //Update the display based on the layers

}

EN.centerMark = function() {
  EN.CX.strokeStyle = EN.invertColor(data.pages[data.slctPage].M.C, 1);

  //Center Cross aka 0,0
  EN.CX.beginPath();
  EN.CX.moveTo(EN.CP.X-(EN.Z*data.pages[data.slctPage].E.SC.X)-2,EN.CP.Y-(EN.Z*data.pages[data.slctPage].E.SC.Y)-2);
  EN.CX.lineTo(EN.CP.X-(EN.Z*data.pages[data.slctPage].E.SC.X)+2,EN.CP.Y-(EN.Z*data.pages[data.slctPage].E.SC.Y)+2);
  EN.CX.stroke();
  EN.CX.beginPath();
  EN.CX.moveTo(EN.CP.X-(EN.Z*data.pages[data.slctPage].E.SC.X)+2,EN.CP.Y-(EN.Z*data.pages[data.slctPage].E.SC.Y)-2);
  EN.CX.lineTo(EN.CP.X-(EN.Z*data.pages[data.slctPage].E.SC.X)-2,EN.CP.Y-(EN.Z*data.pages[data.slctPage].E.SC.Y)+2);
  EN.CX.stroke();
}

EN.invertColor = function(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) { return ""; }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + EN.padZero(r) + EN.padZero(g) + EN.padZero(b);
}

EN.padZero = function (str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}
