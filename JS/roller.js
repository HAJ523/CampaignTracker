var Roller = {};

//Will walk through a string and attempt to consilidate it into a single result.
Roller.recurParse = function(data) {
  var nextLoc;
  var temp;
  var local = 0; //We start at the beginning of the string.

  //Build an array to use as the stack for parsing the output. Start with a single stacked emptry string
  var stack=[""];

  //Start Loop here.

  nextLoc = Roller.nextOpenClose(data,local);

  if (nextLoc[1] == '(') { //We must add to the current stack then create a new stack level.
    //If there is info before then add it to the current stack.
    if (nextLoc[0] > local) {
      stack[stack.length - 1] += data.substring(local,nextLoc[0]-1);
    }

    //Now that we have a new element push a new level. and increment our local.
    stack.push("");
    local = nextLoc[0]+1; //Increment to remove '('.
  } else if (nextLoc[1] == ')') { //we must process the inner stack.
    //If there is info before then add it to the current stack.
    if (nextLoc[0] > local) {
      stack[stack.length - 1] += data.substring(local,nextLoc[0]-1);
    }

    //Now evaluate the top level node and push it into the lower stack.
    temp = Roller.parse(stack.pop());
    stack[stack.length - 1] += temp;
    local = nextLoc[0]+1; //Increment to remove ')'.
  } else { //We must process the outer stacks all the way down.
    //We must be at the end of the string if there is data left add it to the last stack.
    if (nextLoc[0] > local) {
      stack[stack.length - 1] += data.substring(local,nextLoc[0]-1);
    }

    local = nextLoc[0]; //Increment local to end of string.

    //Process all of the stacks in order until nothing remains.
    while(stack.length > 0) {
      temp = Roller.parse(stack.pop());

      //If we are not on the last node the append to the roll
      if (stack.length > 0) {
        stack[stack.length - 1] += temp;
      } else {
        return temp; //We are finally done with the nested processing so return.
      }
    }
  }

  //If the close location is less than the open and not -1 then we need to close and parse a stack.

}

Roller.dice = function(string, id) {
  var element = document.getElementById(id)

  //If the value only starts with +/- something then roll using the default dice for this campaign.
  if (RegExp(/^(\+|-)\d*/g).test(string)) {
    string = data.settings.dice + string;
    element.title = string; //Make sure that once when we click on this it gets an updated title.
  }

  //set some highlight until rolling is complete.
  element.innerHTML = Roller.parse(string);

  //Faux rolling look.
  var PrevWait = 0;
  for (var i = 1; i < 6; i++) {
    PrevWait+=(i*25);
    setTimeout(function(){element.innerHTML = Roller.parse(string);},PrevWait);
  }

  setTimeout(function(){element.innerHTML = Roller.parse(string);},575);
}

//Used to parse an individual expression for dice or table.
Roller.parse = function(data) {
  return data.replace(/(\d+)d(\d+)(kh\d+|kl\d+|ku|\!)?(\+\d+|\-\d+)?/g, function() {
    var tempAry = [];
    var result;

    if (arguments[3] != null) {
      if (arguments[3].indexOf("ku") > -1) { //If we are only keeping unique rolls then we need to handle rolling special.
        var d = parseInt(arguments[2]);
        var n = parseInt(arguments[1]);
        //var r = parseInt(arguments[3].substring(2));
        if (parseInt(arguments[1]) >= d) {
          tempAry.push(((d*(d+1))/2));
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
    }
    result = tempAry.reduce(function(tot,cur){return tot+cur},tempvalue);
    return result;
  }).replace(/(\d)t([^ ]*)[ ]?/g, function () {
    //TODO add table parsing.
    //Load the table into memory from its current form.
    //Roll on the table the correct number of times based on the
    //Once a table value has been rolled check to see if the results of that roll need to go through the whole process again. Add counter to ensure that we only allow so many levels of recursion deep.
  }) //TODO Add unit tests for rolling to make sure that they are performing as expected.
}

Roller.nextOpenClose = function(data,local) {
  //Find the next instance of an open or close from the current cursor location.
  var opnLoc = data.indexOf('(',local);
  var clsLoc = data.indexOf(')',local);

  //If there are more open and close parens then return the first instance of either.
  //If there is only an open or only a close then return that. (Note that only open remaining is technically a broken case.)
  //If there are no more open and close then return the end of the string.
  if ((opnLoc >= 0) && (clsLoc >= 0)) {
    if (opnLoc < clsLoc) {
      return [opnLoc, '('];
    } else {
      return [clsLoc, ')'];
    }
  } else if (opnLoc >= 0) { //This case should not happen. It would indicate incorrect build.
    return [opnLoc, '('];
  } else if (clsLoc >= 0) {
    return [clsLoc, ')'];
  } else {
    return [data.length,''];
  }
}
