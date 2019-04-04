/*
  Handle map creation and display tools.

  Author: HAJ523
  2019-03 Created.
*/

var MR = {};
MR.FS = 12; //Default font size. Variable until the best size is determined. in Pixels.
MR.BR = 10; //Border size.
MR.ZM = 1;
MR.MD = false;
MR.PL = []; //Palette should be empty.
MR.PN = ""; //Current Palette name.
MR.brushSizesSquare = {S:[[0,0]], M:[[1,0],[1,1],[1,-1],[0,1],[0,-1],[-1,0],[-1,-1],[-1,1]], L:[[2,2],[2,1],[2,0],[2,-1],[2,-2],[1,2],[1,-2],[0,2],[0,-2],[-1,2],[-1,-2],[-2,2],[-2,1],[-2,0],[-2,-1],[-2,-2]]};
MR.brushSizesHex = {};

/*
  Scope: Public
  Description: Any setup needed for the mapper to function after page has loaded.
*/
MR.onLoad = function() {
  MR.CV = document.getElementById('MapCanvas');
  MR.CX = MR.CV.getContext("2d");
}

/*
  Scope: Public
  Description: Called when switching to map view.
*/
MR.initMapper = function() {
  MR.newPalette(); //Default palette
  MR.slctTile = 0;
  MR.PN = "";
  MR.MD = false;
  MR.UNDO = [];

  //Start with the correct tool and layer selected.
  MR.selectTool("B");
  MR.selectLayer("T");
  MR.selectSize("S");

  //Build the HTML of the pallette.
  MR.selectTile(null, 0);
  MR.buildHTMLPalette();

  MR.CV.addEventListener("mousedown",MR.mouseChange);
  MR.CV.addEventListener("mouseup",MR.mouseChange);
  MR.CV.addEventListener("mouseout", MR.mouseOut);
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
      forceupdate = 1;
    }

    //If the height is less then trim the heights.
    if (h < data.pages[p].M.H) {
      forceupdate = 1;
    }

    //If we trimmed the height or width the loop over the keys and look for bad elements.
    if (forceupdate) {
      for (var t in data.pages[p].M.A) {
        //square
        var temp = t.split(",");
        if (parseInt(temp[0]) >= w) {delete data.pages[p].M.A[t]; continue;}
        if (parseInt(temp[1]) >= h) {delete data.pages[p].M.A[t];}
      }
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
    data.pages[p].M.A = {};
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
  MR.CX.fillStyle = data.pages[data.slctPage].M.C;
  MR.CX.fillRect(0,0,MR.CV.width, MR.CV.height);

  //Setup the font for printing to the canvas.
  MR.CX.font = MR.FS + "px Square";
  MR.CX.textAlign = "left";
  MR.CX.textBaseline = "top";

  //Loop over the current elements.
  for (var k in data.pages[data.slctPage].M.A) {
    MR.printTile(k.split(",").map(function(x) {return parseInt(x,10);}),k);
  }
}

/*
  Scope: Public
  Description: Print a single tile to the canvas.
*/
MR.printTile = function(loc, t) {//Location, TileAddress
  if (data.pages[data.slctPage].M.A.hasOwnProperty(t)) {

    tile = data.pages[data.slctPage].M.A[t];

    //square drawing.
    var x = MR.BR + loc[0] * MR.FS;
    var y = MR.BR + loc[1] * MR.FS;

    MR.CX.fillStyle = data.pages[data.slctPage].M.C;
    MR.CX.fillRect(x, y, MR.FS, MR.FS);

    if (tile == null) { return; } //If there is nothing to draw move on.

    MR.CX.fillStyle = tile.C;

    switch(MR.LY) {
      case "T":
        MR.CX.fillText(tile.T, x, y);
        break;
      case "L":
        MR.CX.fillText(tile.L, x, y);
      break;
      case "O":
        switch (tile.O) {
          case 0:
            MR.CX.fillText("0", x, y);
            break;
          case .125:
            MR.CX.fillText("1", x, y);
            break;
          case .25:
            MR.CX.fillText("2", x, y);
            break;
          case .5:
            MR.CX.fillText("5", x, y);
            break;
          case .75:
            MR.CX.fillText("7", x, y);
            break;
          case .875:
            MR.CX.fillText("8", x, y);
            break;
          case 1:
            MR.CX.fillText("#", x, y);
            break;
        }
        break;
      case "W":
        switch(tile.W) {
          case 0:
            MR.CX.fillText(tile.W, x, y);
            break;
          case .5:
            MR.CX.fillText("4", x, y);
            break;
          case 1:
            MR.CX.fillText("2", x, y);
            break;
          case 2:
            MR.CX.fillText("1", x, y);
            break;
        }
        break;
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
    //Setup the undo array. by adding new object to beginning.
    MR.UNDO.unshift({});
    if (MR.UNDO.length > 20) {
      MR.UNDO.pop();
    }
    MR.CV.addEventListener('mousemove', MR.mouseMove); //Add the move listener.
    delete MR.LL;
    delete MR.FL;
    //Draw to current location
    MR.mouseMove(e);
    //TODO undo list
  } else {
    MR.CV.removeEventListener('mousemove', MR.mouseMove); //Remove the move listener.
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
    MR.CV.removeEventListener('mousemove', MR.mouseMove);
    MR.MD = false; //Make sure that we stop drawing!
  }
}

MR.mouseMove = function(e) {
  var rect = e.target.getBoundingClientRect();
  var loc = MR.mouseToMapLoc(e.clientX - rect.left, e.clientY - rect.top);

  MR.drawPoint(loc);
}

MR.drawPoint = function(loc) {
  if (loc == null) {return;} //If loc isn't populated then there is nothing to do!
  if ((MR.hasOwnProperty('LL')) && (loc[0] == MR.LL[0]) && (loc[1] == MR.LL[1])) {return;} //If there was no movement then quit.
  switch(MR.CT) {
    case "E":
    case "B":
      var pts = MR.bresLine(loc,MR.LL);
      //Repaint the canvas at that location with the new tile.
      for (var i=0;i<pts.length;i++) {
        switch(MR.TS) {
          case "L":
            MR.brushPoint(pts[i], "L");
          case "M":
            MR.brushPoint(pts[i], "M");
          case "S":
          default:
            MR.brushPoint(pts[i], "S");
        }
      }
      break;
    case "L":
      if (MR.FL == null) {MR.FL = loc;} //Store the first line point for later!
      var prvKeys = Object.keys(MR.UNDO[0]); //Get all of the old keys in Undo.
      var pts = MR.bresLine(loc,MR.FL);
      //Repaint the canvas at that location with the new tile.
      for (var i=0;i<pts.length;i++) {
        switch(MR.TS) {
          case "L":
            MR.brushPoint(pts[i], "L", prvKeys);
          case "M":
            MR.brushPoint(pts[i], "M", prvKeys);
          case "S":
          default:
            MR.brushPoint(pts[i], "S", prvKeys);
        }
      }
      prvKeys.map(function(k) { //Loop over the remaining keys and revert the tile.
        if ( k == undefined ) {return;}
        data.pages[data.slctPage].M.A[k] = MR.UNDO[0][k];
        delete MR.UNDO[0][k];
        MR.printTile(k.split(",").map(function(x) {return parseInt(x,10);}),k);
      });
      break;
    case "F":
      var lStk = [];
      lStk.push(loc);
      var l,rl,rr,k;
      while ((l = lStk.pop()) != null) {
        while ((l[1]--) > 0 && data.pages[data.slctPage].M.A[l[0]+","+l[1]] == undefined) {} //Find the first pixel in the column.
        rl=false; rr=false;
        while((l[1]++) < (data.pages[data.slctPage].M.H-1) && data.pages[data.slctPage].M.A[l[0]+","+l[1]] == undefined) {
          k = l[0]+","+l[1];
          MR.UNDO[0][k] = undefined; //They will always be undefined as that is the only place we allow fill.
          MR.setMapTile(l, k);
          if (l[0] > 0) { //Check left
            if (data.pages[data.slctPage].M.A[(l[0]-1)+","+l[1]] == undefined) {
              if (!rl) {
                lStk.push([l[0]-1,l[1]]);
                rl = true;
              }
            } else {
              rl = false;
            }
          }
          if (l[0] < (data.pages[data.slctPage].M.W - 1)) { //Check right.
            if (data.pages[data.slctPage].M.A[(l[0]+1)+","+l[1]] == undefined) {
              if (!rr) {
                lStk.push([l[0]+1,l[1]]);
                rr = true;
              }
            } else {
              rr = false;
            }
          }
        }
      }

      //Don't allow draging a fill operation. It happens then it is done!
      MR.mouseOut();
      break;
    case "C":
      var k = loc[0]+","+loc[1];
      if (data.pages[data.slctPage].M.A[k] != undefined) { //If there is a tile in the location.
        MR.addTileToPalette(Object.assign({},data.pages[data.slctPage].M.A[k]));
      }
      MR.UNDO.shift(); //remove extra undo option for copying to palette.
      MR.mouseOut(); //No drag and copy single click only.
      break;
    case "S":
      if (MR.FL == null) {MR.FL = loc;} //Store the first line point for later!
      var prvKeys = Object.keys(MR.UNDO[0]); //Get all of the old keys in Undo.

      //Side 1
      var pts = MR.bresLine(MR.FL, [MR.FL[0], loc[1]])
      .concat(MR.bresLine(MR.FL, [loc[0], MR.FL[1]]))
      .concat(MR.bresLine(loc, [MR.FL[0], loc[1]]))
      .concat(MR.bresLine(loc, [loc[0], MR.FL[1]]));

      //Repaint the canvas at that location with the new tile.
      for (var i=0;i<pts.length;i++) {
        switch(MR.TS) {
          case "L":
            MR.brushPoint(pts[i], "L", prvKeys);
          case "M":
            MR.brushPoint(pts[i], "M", prvKeys);
          case "S":
          default:
            MR.brushPoint(pts[i], "S", prvKeys);
        }
      }
      prvKeys.map(function(k) { //Loop over the remaining keys and revert the tile.
        if ( k == undefined ) {return;}
        data.pages[data.slctPage].M.A[k] = MR.UNDO[0][k];
        delete MR.UNDO[0][k];
        MR.printTile(k.split(",").map(function(x) {return parseInt(x,10);}),k);
      });

      break;
    case "R":
      if (MR.FL == null) {MR.FL = loc;} //Store the first line point for later!
      var prvKeys = Object.keys(MR.UNDO[0]); //Get all of the old keys in Undo.

      //Todo get array of points to be painted.
      var pts = MR.midPointCircle(MR.FL, Math.floor(Math.hypot(MR.FL[0]-loc[0],MR.FL[1]-loc[1])));

      //Repaint the canvas at that location with the new tile.
      for (var i=0;i<pts.length;i++) {
        switch(MR.TS) {
          case "L":
            MR.brushPoint(pts[i], "L", prvKeys);
          case "M":
            MR.brushPoint(pts[i], "M", prvKeys);
          case "S":
          default:
            MR.brushPoint(pts[i], "S", prvKeys);
        }
      }
      prvKeys.map(function(k) { //Loop over the remaining keys and revert the tile.
        if ( k == undefined ) {return;}
        data.pages[data.slctPage].M.A[k] = MR.UNDO[0][k];
        delete MR.UNDO[0][k];
        MR.printTile(k.split(",").map(function(x) {return parseInt(x,10);}),k);
      });
      break;
  }
  MR.LL = loc; //Update the previous loc.
}

/*
  Scope: Private
  Description: paint all tiles in the brush location.
*/
MR.brushPoint = function(loc, s, keys) {//Location, Size, oldKeyArray
  var x=0;
  var y=0;
  var t;

  //Loop over the brush and paint tiles.
  for(var i=0;i<MR.brushSizesSquare[s].length;i++) {
    //Brush bristle location.
    x = loc[0]+MR.brushSizesSquare[s][i][0];
    y = loc[1]+MR.brushSizesSquare[s][i][1];
    t = x+","+y;

    //Check to make sure the bristle is on the map!
    if (x < 0) {continue;}
    if (x >= data.pages[data.slctPage].M.W) {continue;}
    if (y < 0) {continue;}
    if (y >= data.pages[data.slctPage].M.H) {continue;}

    if (keys != null) { //If we have an old key set then we need to record that we are still paining at the current location.
      var idx = keys.indexOf(t);
      if (idx > -1) {
        delete keys[idx];
      }
    }

    //Add new tile to the undo if it isn't there already
    if (MR.UNDO[0].hasOwnProperty(t)) {continue;}
    MR.UNDO[0][t] = data.pages[data.slctPage].M.A[t];

    MR.setMapTile([x,y], t);
  }
}

MR.setMapTile = function(loc, k) {
  //Choose a random tile from the palette.
  if (MR.CT == "E") {
    data.pages[data.slctPage].M.A[k] = undefined;
  } else {
    data.pages[data.slctPage].M.A[k] = Object.assign({},MR.PL[Math.floor(Math.random()*MR.PL.length)]);
  }

  MR.printTile(loc, k);
}

/*
  Scope: Public
  Description: Used to clear any undo / selection data when changing pages.
*/
MR.clearMapper = function() { //TODO determine if this is needed with initMapper existing.
  MR.CT = "B"; //Default to the brush.
  MR.CL = "T";
  delete MR.UNDO; //Delete any current drawing operations.
  MR.ZM = 1; //Set the zoom scale back to 1.
}

MR.undo = function() {
  var l = MR.UNDO.shift(); //Get the first element.

  for (var k in l) {
    data.pages[data.slctPage].M.A[k] = l[k];
    MR.printTile(k.split(",").map(function(x) {return parseInt(x,10);}),k);
  }
}

/*
  Scope: Public
  Description: Select the tool size for brushes and lines.
*/
MR.selectSize = function(s) {
  document.getElementById('toolB').innerHTML = document.getElementById('size'+s).innerHTML;
  MR.TS = s;
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

/*
  Scope: Public
  Description: Select the layer for display.
*/
MR.selectLayer = function(l) { //Layer
  if (MR.LY != undefined) {
    document.getElementById("layer" + MR.LY).classList.remove("w3-btn-pressed");
  }
  MR.LY = l;
  document.getElementById('layer' + l).classList.add("w3-btn-pressed");

  MR.updateMapCanvas();
}

MR.incTileLight = function() {
  switch(MR.PL[MR.slctTile].L) {
    case 0:
    case 1:
      MR.selectTileLight(MR.PL[MR.slctTile].L+1);
      break;
    case 2:
    default:
      MR.selectTileLight(0);
  }
}

MR.incTileOcclusion = function() {
  switch(MR.PL[MR.slctTile].O) {
    case 0:
    case 0.125:
    case 0.75:
    case 0.875:
      MR.selectTileOcclusion(MR.PL[MR.slctTile].O+.125);
      break;
    case 0.25:
    case 0.5:
      MR.selectTileOcclusion(MR.PL[MR.slctTile].O+.25);
      break;
    case 1:
    default:
      MR.selectTileOcclusion(0);
  }
}

MR.incWalkable = function() {
  switch(MR.PL[MR.slctTile.W]) {
    case 0:
    case .5:
      MR.selectTileWalkable(MR.PL[MR.slctTile.W]+.5);
      break;
    case 1:
      MR.selectTileWalkable(2);
      break;
    case 2:
      MR.selectTileWalkable(0);
      break;
  }
}

/*
  Scope: Public
  Description: Set the light on the current title and update the display.
*/
MR.selectTileLight = function(l) {//Lighting
  MR.PL[MR.slctTile].L = l;
  MR.setLightGui();
}

/*
  Scope: Public
  Description Set the occlusion on the current tile and update the display.
*/
MR.selectTileOcclusion = function(o) {//Occlusion
  MR.PL[MR.slctTile].O = o;
  MR.setOcclusionGui();
}

/*
  Scope: Public
  Description: Change the walkable status of a tile!
*/
MR.selectTileWalkable = function(w) {
  MR.PL[MR.slctTile].W = w;
  MR.setWalkableGui();
}

MR.buildHTMLPalette = function() {
  document.getElementById('paletteDisplay').innerHTML=""; //Clear the palette before rebuilding.
  //Loop over all the tiles.
  for(var i = 0; i < MR.PL.length; i++) {
    MR.addHTMLTileToPalette(i);
  }
}

MR.addHTMLTileToPalette = function(i) {
  var el = document.getElementById('paletteDisplay');
  el.innerHTML += '<span onclick="javascript:MR.selectTile(this);" style="background: ' + data.pages[data.slctPage].M.C + '; color: '+MR.PL[i].C+'">' + MR.PL[i].T + '</span>';
}

MR.remHTMLTileFromPalette = function(i) {
  var el = document.getElementById('paletteDisplay');
  el.removeChild(el.children[i]);
}

MR.selectTile = function(e, i) {
  if ((i == null) || ( i == undefined)) { i = 0; }
  if (e != null){ while( (e = e.previousSibling) != null )  { i++; }} //Figure out index.
  e = document.getElementById('paletteDisplay');
  if (MR.slctTile != undefined) {e.children[MR.slctTile].classList.remove('selected');}
  MR.slctTile = i;
  e.children[i].classList.add('selected');
  //Now update the tile editing controls.
  document.getElementById('Tile').value = MR.PL[MR.slctTile].T;
  document.getElementById('TileColor').value = MR.PL[MR.slctTile].C;
  MR.setWalkableGui();
  MR.setLightGui();
  MR.setOcclusionGui();
}

MR.setOcclusionGui = function() { //TODO Combine these gui functions into 1 since they are so similiar?
  document.getElementById('TileOcclusion').innerHTML = document.getElementById("Occ" + MR.PL[MR.slctTile].O).innerHTML;
}

MR.setLightGui = function() {
  document.getElementById('TileLight').innerHTML = document.getElementById("Light" + MR.PL[MR.slctTile].L).innerHTML;
}

MR.setWalkableGui = function() {
  document.getElementById('TileWalkable').innerHTML = document.getElementById("Walk" + MR.PL[MR.slctTile].W).innerHTML;
}

/*
  Scope: CT3.html
  Description: Add a tile to the currently selected palette.
*/
MR.addTileToPalette = function(t) {
  if (t == null || t == undefined) {
    MR.PL.push(Object.assign({},MR.PL[MR.slctTile]));
  } else {
    MR.PL.push(t);
  }
  MR.addHTMLTileToPalette(MR.PL.length-1);
  MR.selectTile(null, MR.PL.length-1);
}

MR.remTileFromPalette = function() {
  if (MR.PL.length == 1) {return;} //Prevent removing the last tile of the palette. //TODO reset tile to default.
  var i = MR.slctTile;
  MR.PL.splice(i,1);
  if (MR.slctTile >= MR.PL.length) {
    MR.selectTile(null, MR.PL.length-1);
  } else {
    MR.selectTile(null, MR.slctTile);
  }
  MR.remHTMLTileFromPalette(i);
}

//Update the display of the tile.
MR.updatePaletteTile = function() {
  var e = document.getElementById('paletteDisplay');
  MR.PL[MR.slctTile].T = document.getElementById('Tile').value;
  e.children[MR.slctTile].innerHTML = MR.PL[MR.slctTile].T;

  MR.PL[MR.slctTile].C = document.getElementById('TileColor').value;
  e.children[MR.slctTile].style.color = MR.PL[MR.slctTile].C;
}

MR.mapDiagonalDistance = function(s,e) { //Start, End
  return Math.max(Math.abs(s[0]-e[0]),Math.abs(s[1]-e[1]));
}

MR.bresLine = function(s,e) {
  if (e == null) {return [s];}
  var ret = [];
  // Translate coordinates
  var x1 = s[0];
  var y1 = s[1];
  var x2 = e[0];
  var y2 = e[1];
  // Define differences and error check
  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);
  var sx = (x1 < x2) ? 1 : -1;
  var sy = (y1 < y2) ? 1 : -1;
  var err = dx - dy;
  // Set first coordinates
  ret.push([x1, y1]);
  // Main loop
  while (!((x1 == x2) && (y1 == y2))) {
    var e2 = err << 1;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
    // Set coordinates
    ret.push([x1, y1]);
  }
  // Return the result
  return ret;
}

MR.midPointCircle = function(l,r) {//Center, Radius
  var ret = [];
  var x = r, y = 0;
  ret.push([l[0]+x, l[1]]);
  if (r > 0) {
    ret.push([l[0]-x, l[1]]);
    ret.push([l[0], l[1]+x]);
    ret.push([l[0], l[1]-x]);
  }
  var p = 1-r;
  while(x > y) {
    y++;
    if (p <= 0) {
      p = p + 2 * y + 1;
    } else {
      x--;
      p = p + 2*y - 2*x +1;
    }
    if (x < y) {break;}

    ret.push([l[0]+x, l[1]+y]);
    ret.push([l[0]+x, l[1]-y]);
    ret.push([l[0]-x, l[1]+y]);
    ret.push([l[0]-x, l[1]-y]);

    if (x != y) {
      ret.push([l[0]+y, l[1]+x]);
      ret.push([l[0]+y, l[1]-x]);
      ret.push([l[0]-y, l[1]+x]);
      ret.push([l[0]-y, l[1]-x]);
    }
  }

  return ret;
}

MR.distance = function(s,e) {//Loc 1, Loc 2
  var a = s[0]-e[0];
  var b = s[1]-e[1];
  return Math.sqrt(a*a + b*b);
}

MR.savePalette = function() {
  CT.prompt(MR.savePaletteFinalize, "Save Palette", "Name to save palette as?", "Name", "Palette Name", MR.PN);
}

MR.savePaletteFinalize = function(name) {
  if ((name == null) || (name == "")) {return;} //If we cancelled or a bad name is selected then quit.

  var add = false;

  if (!data.hasOwnProperty("palettes")) {
    data.palettes = {}
  }

  if (data.palettes.hasOwnProperty(name)) {
    delete data.palettes[name];
  } else {
    add = true;
  }
  data.palettes[name] = [];

  //Loop through the palette and save a copy of each tile to the named palette.
  for (var i=0;i<MR.PL.length;i++) {
    data.palettes[name].push(Object.assign({},MR.PL[i]));
  }

  if (add) {MR.addPaletteHTML(name);} //Only add new name if this is really a new addition.
  MR.PN = name;
  document.getElementById('PaletteName').innerHTML=name;
}

MR.selectPalette = function(k) {
  MR.PN = k;

  delete MR.PL;
  MR.PL = [];
  for (var i=0;i<data.palettes[k].length;i++) {
    MR.PL.push(Object.assign({},data.palettes[k][i])); //Make a copy so that we don't accidentally change the palette values without clicking save.
  }

  MR.buildHTMLPalette();
  MR.selectTile(null, 0);
  document.getElementById('PaletteName').innerHTML=k;
}

MR.deletePalette = function() {
  if (MR.PN == "") { return; }
  delete data.palettes[MR.PN]
  MR.removePaletteHTML(MR.PN);
  delete MR.PN;

  MR.newPalette(); //Refill the palette.
}

MR.newPalette = function() {
  delete MR.PL;
  delete MR.PN;
  delete MR.slctTile;
  MR.PL = [{T:".", C:"#ffffff", L:0, O:0.0, W:1}];
  MR.buildHTMLPalette();
  MR.selectTile(null, 0);
  document.getElementById('PaletteName').innerHTML="Palette";
}

MR.buildPaletteHTML = function() {
  for (var k in data.palettes) {
    MR.addPaletteHTML(k);
  }
}

MR.addPaletteHTML = function(k) {//Key
  var el = document.getElementById('PaletteList');
  el.innerHTML += "<a href=\"javascript:MR.selectPalette('"+k+"');\" class=\"w3-btn w3-padding-none\" id=\"pl"+k+"\">"+k+"</a>";
}

MR.removePaletteHTML = function(k) {
  document.getElementById('PaletteList').removeChild(document.getElementById("pl" + k));
}
