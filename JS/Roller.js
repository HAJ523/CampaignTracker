/*
  Tag for all rolling and table functions.

  Author: HAJ523
  2019-01 Created.
*/

var RL = {};

/*
  Scope: Public
  Description: Performs roll on click and updates element display!
*/
RL.roll = function(s, i) {
  var e = document.getElementById(i);
  e.title = s;
  e.innerHTML = RL.recursiveParse(undefined, s);
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
  console.log(s);

  //If the value only starts with +/- something then roll using the default dice for this campaign.
  if (RegExp(/^(\+|-)\d*/g).test(s)) {
    s = data.settings.dice + s;
  }

  return s.replace(/(\d+)d(\d+)(kh\d+|kl\d+|ku|\!)?(\+\d+|\-\d+)?/g, function() {
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
        //'arguements' object will always contain 1 & 2 for number of rolls and dice size.
        //Loop over all f the times we must roll.
        for (var i = 0; i < parseInt(arguments[1]); i++) {
          tempAry.push(Math.floor(Math.random()*arguments[2])+1);
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

    //Check for an addition at the end of the roll.
    var tempvalue = 0;
    if (arguments[4] != null) {
      if (arguments[4].indexOf("+") || arguments[4].indexOf("-")) {
        tempvalue = parseInt(arguments[4]);
      }
    } //TODO Add some form of output to show the dice!
    result = tempAry.reduce(function(tot,cur){return tot+cur},tempvalue);
    return result;
  })
}
