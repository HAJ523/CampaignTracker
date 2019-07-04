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

  EN.FS = document.getElementById("ENZoom").value;

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

  if(id == "") {//If there was no ID then this is likely the first entry. Assume addition.
    id = CT.GUID(8);
    data.pages[data.slctPage].E.OC[id] = {};
    //Make Effects Visible
    document.getElementById('Effects').classList.remove('w3-hide');
    //TODO Add to object selection HTML list.
  }

  var obj = data.pages[data.slctPage].E.OC[id];

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
  var id = CT.GUID(8); //Get id for new object.
  //Now copy that object and effects into a new object.

  //Copy
}

EN.removeOC = function() {
  var obj = document.getElementById('OCID').value;

  //Delete
  delete data.pages[data.slctPage].E.OC[obj];

  //Find and remove from OCList
  var el = document.getElementById('OCL-' + obj);
  el.parentElement.removeChild(el);
}

EN.addEffect = function() {
  var objid = document.getElementById('OCID').value;
  var obj = data.pages[data.slctPage].E.OC[objid];
  var effType = document.getElementById('OCEFType').value;
  if (effType=="0") {return;} //If no effect type is selected then quit.

  var id = CT.GUID(8); //Effect ID
  var tp = document.getElementById('OCEFType').value;

  if (!obj.hasOwnProperty('Es')) { //Build the effect list if it doesn't exist.
    obj.Es = {};
  }

  if (!obj.Es.hasOwnProperty(tp)) {//If the object doesn't have an effect of this type yet.
    obj.Es[tp] = {};
  }

  //Add effect to object.
  obj.Es[tp][id] = {};
  obj.Es[tp][id].Sh = document.getElementById('OCEFShape').value;
  obj.Es[tp][id].Si = document.getElementById('OCEFSize').value;
  if (tp == "3") {
    obj.Es[tp][id].Oc = document.getElementById('OCEFOcc').value;
  } else if (tp == "4") {
    obj.Es[tp][id].Te = document.getElementById('OCEFTer').value;
  }



  //Add Effect to display list.
  document.getElementById('OCEffectList').innerHTML += '<div id="Eff' + id + '"><a href="javascript:EN.removeEffect(\'' + id + '\');" class="w3-btn w3-padding-small-square fas fa-minus-circle"></a> <i class="fas">'+EN.eType[tp]+' '+EN.eShape[obj.Es[ts][id].Sh]+'</i> <i class="fas fa-glasses"></i></span></div>';

  //Clear the Effect inputs.
  EN.clearEffectInput();
}

EN.changeType = function() {
  var type = document.getElementById('OCEFType').value;
  var cond1 = document.getElementById('OCEFOcc');
  var cond2 = document.getElementById('OCEFTer');

  switch(type) {
    case "B":
    case "D":
      cond1.classList.add("w3-hide");
      cond2.classList.add("w3-hide");
      break;
    case "O":
      cond1.classList.remove('w3-hide');
      cond2.classList.add('w3-hide');
      break;
    case "T":
      cond1.classList.add('w3-hide');
      cond2.classList.remove('w3-hide');
      break;
  }
}

EN.changeShape = function() {
  var el = document.getElementById('OCEFSize');
  var s = document.getElementById('OCEFShape').value;

  switch(s) {
    case "C":
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

  EN.resetTempMapLayers();

  //Create Object & Creatures Arrays
  data.pages[data.slctPage].E.OC = {};

  //Setup default selection
  data.pages[data.slctPage].E.SC = {X:0,Y:0};
}

EN.resetTempMapLayers = function() {
  //Loop through all keys and initialize arrays to Map values.
  for (var k in data.pages[data.slctPage].M.A) {
    data.pages[data.slctPage].E.O[k] = data.pages[data.slctPage].M.A[k].O
    data.pages[data.slctPage].E.L[k] = data.pages[data.slctPage].M.A[k].L
    data.pages[data.slctPage].E.W[k] = data.pages[data.slctPage].M.A[k].W
  }
}

EN.resetEncounterCanvas = function() {
  //Clear the canvas and reset the dimensions.
  EN.CV.width = EN.CV.clientWidth;
  EN.CV.height = EN.CV.clientHeight;

  //Update to new center.
  EN.CP = {X:Math.floor(EN.CV.width/2),Y:Math.floor(EN.CV.height/2)};

  //Setup the font for printing to the canvas.
  EN.CX.font = EN.FS + "px Square";
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
  //Loop over effect types in order.
  ["O","B","D","T"].forEach(function(v) {
    for(var k in data.pages[data.slctPage].E.OC) {
      if (!data.pages[data.slctPage].E.OC.hasOwnProperty("L")) {continue;} //Skip if the object has no location.
      if (!data.pages[data.slctPage].E.OC[k].hasOwnProperty('Es')) {continue;}
      if (!data.pages[data.slctPage].E.OC[k].Es.hasOwnProperty(v)) {continue;}
      for (var j in data.pages[data.slctPage].E.OC[k].Es[v]) {
        EN.shapeMap(data.pages[data.slctPage].E.OC.L.split(",").map(function(x) {return parseInt(x,10);}),data.pages[data.slctPage].E.OC.Es[v][j],EN.funcShaped[v]);
      }
    }
  });

  //Update the display based on the layers
  for(var k in data.pages[data.slctPage].M.A) {

  }
  for(var k in data.pages[data.slctPage].E.OC) { //Now overwrite map with objects.

  }
}

EN.funcShaped = {
  T:function(k,eff) {
    data.pages[data.slctPage].E.W[k] = eff.Te;
  },
  D:function(k,eff) {
    if (data.pages[data.slctPage].E.L[k]>1) {return;} //Cannot dim a bright square.
    data.pages[data.slctPage].E.L[k] = 1;
  },
  B:function(k,eff) {
    data.pages[data.slctPage].E.L[k] = 2;
  },
  O:function(k,eff) {
    if (data.pages[data.slctPage].E.O[k] == 1) {return;} //Cannot have higher occlusion than 1.

    //Increase the value and if it is more than 1 reset to 1.
    data.pages[data.slctPage].E.O[k] += eff.Oc;
    if (data.pages[data.slctPage].E.O[k] > 1) {data.pages[data.slctPage].E.O[k]=1;}
  }
};

EN.shapeMap = function(eff,cb) {
  var tl,br;
  if (eff.Sh == 'S') {
    var s2 = Math.floor(eff.Si/2);
    br = [cen[0]+s2,cen[1]+s2]; //Always the same for even and odd sided squares.
    if (eff.Si%2 == 0) {//Even sided less on top and left.
      tl = [cen[0]-s2+1,cen[1]-s2+1];
    } else {//Odd sided even number on either side of center.
      tl = [cen[0]-s2,cen[1]-s2]
    }

    //Loop over the square and perform callback.
    for(var i=tl[0];i<=br[0];i++) {
      for(var j=tl[1];i<=br[1];j++) {
        cb(i,j,eff);
      }
    }
  } else { //Circle
    var mx = eff.Si*eff.Si+eff.Si;
    for (var i=-eff.Si;i<=eff.Si;i++) {
      for (var j=-eff.Si;j<=eff.Si;j++) {
        if (i*i+j*j < mx) {
          var k = i+","+j;
          //Make sure that we only add information for squares on the map.
          if (!data.pages[data.slctPage].M.A.hasOwnProperty(k)) {continue;}
          cb(k,eff);
        }
      }
    }

  }
}

EN.centerMark = function() {
  EN.CX.strokeStyle = EN.invertColor(data.pages[data.slctPage].M.C, 1);

  //Center Cross aka 0,0
  EN.CX.beginPath();
  EN.CX.moveTo(EN.CP.X-(EN.FS*data.pages[data.slctPage].E.SC.X)-2,EN.CP.Y-(EN.FS*data.pages[data.slctPage].E.SC.Y)-2);
  EN.CX.lineTo(EN.CP.X-(EN.FS*data.pages[data.slctPage].E.SC.X)+2,EN.CP.Y-(EN.FS*data.pages[data.slctPage].E.SC.Y)+2);
  EN.CX.stroke();
  EN.CX.beginPath();
  EN.CX.moveTo(EN.CP.X-(EN.FS*data.pages[data.slctPage].E.SC.X)+2,EN.CP.Y-(EN.FS*data.pages[data.slctPage].E.SC.Y)-2);
  EN.CX.lineTo(EN.CP.X-(EN.FS*data.pages[data.slctPage].E.SC.X)-2,EN.CP.Y-(EN.FS*data.pages[data.slctPage].E.SC.Y)+2);
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
