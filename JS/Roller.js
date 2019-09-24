/*
  Tag for all rolling and table functions.

  Author: HAJ523
  2019-01 Created.
*/

var RL = {};

RL.CFMCOLOR = {"stat-mix":"#CC0","stat-crit":"#0C0","stat-fail":"#C00","stat-roll":"#000"}

RL.calc = function(id) {
  RL.CID = id;
  var newcalc = CT.prompt(RL.calcFinish,"Calculation","New calculation or append by beginning with '+'/'-'.","Calculation","Calc");
}

RL.calcFinish = function(c) {
  var el = document.getElementById(RL.CID);

  //Check for @ symbol to use current calculation value!
  c = c.replace(/\@/g,el.innerHTML);

  if (RegExp(/^(\+|\-|\*|\/).*/g).test(c)) { //add,mult,sub,div
    el.title += c;
  } else {
    el.title = c;
  }

  el.innerHTML = eval(el.title);
  RL.CID = ""; //Reset the calc id.
}

/*
  Scope: Public
  Description: Performs roll on click and updates element display!
*/
RL.roll = function(s, h) {//Roll string, Header
  delete RL.diceArray;
  RL.diceArray = []; //Make sure we use a fresh array.
  var ret = RL.inlineRoll(s);
  CT.setStatus(s + " = " + ret.val, ret.da, ret.cfm, h, val);
}

RL.inlineRoll = (s)=>{
  delete RL.diceArray;
  RL.diceArray = []; //Make sure we use a fresh array.
  var ret = {};
  ret.val = RL.recursiveParse(undefined, s);
  ret.da = RL.diceArray.reduce(function(ret,cur){return ret+((ret=="")?"":"\n")+cur;});
  ret.cfm = RL.findCritFailMix();
  return ret;
}

RL.findCritFailMix = function() {
  var fail = 0,crit = 0;
  for(var i=0;i<RL.diceArray.length;i++) {
    if (RegExp(/[^\dd]1[^\d]/g).test(RL.diceArray[i])) {
      fail = 1;
    }
    if (RegExp("[^\\dd]" + RL.diceArray[i].split("d")[1] + "[^\\d]",'g').test(RL.diceArray[i])) {
      crit = 1;
    }

    if (fail&&crit) {return 'stat-mix';} //Break out of loop if we have found one of each.
  }

  if (fail) {return 'stat-fail';}
  if (crit) {return 'stat-crit';}
  return 'stat-roll';
}

/*
  Scope: Public
  Description: Go through the str
*/
RL.recursiveParse = function(s, i) {
  if (RegExp(/\(([^\(\)]*)\)/g).test(i)) {
    return RL.parse(i.replace(/\(([^\(\)]*)\)/g, RL.recursiveParse));
  } else {
    return RL.parse(i);
  }
}

/*
  Scope: Public
  Description: Parse an individual portion of the roll.
*/
RL.parse = function(s) {
//  console.log(s);

  //If the value only starts with +/- something then roll using the default dice for this campaign.
  if (RegExp(/^(\+|-)\d*/g).test(s)) {
    s = data.settings.dice + s;
  }

  return eval(s.replace(/(\d*)t(\w*)(?:\{(\S*)\})?/g, function(m, a, b, c) { //Match, # Rolls, Table, Dice Replacement
    //If the table doesn't exist! Or the column doesn't exist.
    if (!data.tables.hasOwnProperty(b)) { return ""; }
    c = ((c == undefined) ? "" : c); //Normalize Dice.

    //Loop over the number of rolls.
    var ret = ""
    for (var i = 0; i < parseInt(a); i++) {
      if (ret != "") {ret += ' && ';} //Seperate different rolls.
      if (c == "") { //If we are not rolling dice to select table entries evenly.
        ret += data.tables[b][Math.floor(Math.random() * data.tables[b].length)];
      } else { //We need to roll dice or reference another table!
        ret += data.tables[b][RL.parse(c)];
      }
    }
    return ret;
  }).replace(/(\d+)d(\d+)(kh\d+|kl\d+|ku|\!|ro.\d+)?/g, function() {
    var tempAry = [];
    var result;

    if (arguments[3] != null) {
      if (arguments[3].indexOf("ku") > -1) { //If we are only keeping unique rolls then we need to handle rolling special.
        var d = parseInt(arguments[2]);
        var n = parseInt(arguments[1]);
        //var r = parseInt(arguments[3].substring(2));
        if (parseInt(arguments[1]) >= d) {
          tempAry.push(((d*(d+1))/2)); //Asked for more unique values than what is possible so output the sum of all rolls without repeat.
        } else {
          //Populate the array with values.
          for (var i = 0; i < d; i++) {
            tempAry.push(i+1);
          }

          //Remove values randomly based until we have the correct number of rolls.
          while (tempAry.length > n) {
            tempAry.splice(Math.floor(Math.random()*tempAry.length),1);
          }
        }
      } else {
        //Check if we should re-roll some values.
        var reroll = ((arguments[3].indexOf("ro") > -1) ? true : false);
        arguments[3] = ((reroll && (arguments[3].indexOf("=") > -1)) ? arguments[3].replace('=','==').substring(2) : arguments[3].substring(2)); //Handle javascript.
        //'arguements' object will always contain 1 & 2 for number of rolls and dice size.
        //Loop over all f the times we must roll.
        for (var i = 0; i < parseInt(arguments[1]); i++) {
          tempAry.push(Math.floor(Math.random() * arguments[2]) + 1);
          //If we are re-rolling once
          if (reroll) {
            if (eval(tempAry[tempAry.length - 1] + arguments[3])) {
              tempAry[tempAry.length - 1] = Math.floor(Math.random()*arguments[2])+1;
            }
          }
        }
        if (arguments[3].indexOf("kh") > -1) { //If we are keeping only the top highest values then sort the array and slice.
          tempAry.sort(function(a,b){return b - a});
          tempAry = tempAry.slice(0,parseInt(arguments[3].substring(2)));
        } else if (arguments[3].indexOf("kl") > -1) { //Same for lowest values just different sort order.
          tempAry.sort(function(a,b){return a - b});
          tempAry = tempAry.slice(0,parseInt(arguments[3].substring(2)));
        }
      }
    } else {
      //'arguements' object will always contain 1 & 2 for number of rolls and dice size.
      //Loop over all f the times we must roll.
      for (var i = 0; i < parseInt(arguments[1]); i++) {
        tempAry.push(Math.floor(Math.random()*arguments[2])+1);
      }
    }

    RL.diceArray.push("["+tempAry.reduce(function(ret,cur){return ret+((ret=="")?"":",")+cur;})+"]d"+arguments[2]);
    result = tempAry.reduce(function(tot,cur){return tot+cur});
    return result;
  }));
}
