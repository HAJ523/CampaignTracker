var Gen = {};

//Generators must be functions accepting the following parameters:
// num - Number of entries to Generate
// opt1 - For name generators this is Gender for the name.

Gen.displayModal = function(name, title, num) {
  //Remove everything from the modal window.
  var node = document.getElementById('ModalContent');
  while (node.lastChild) {
    node.removeChild(node.lastChild);
  }

  //Add the display info to the modal. for the edit page without populating the inputs.
  node.appendChild(document.getElementById('GeneratorModal').cloneNode(true));

  //Update generator display title and fields.
  document.getElementById('GeneratorModalTitle').innerHTML = title;
  Gen.addModalContent(name, num);

  //Update the generate button to call the generation function specified.
  document.getElementById('GeneratorModalGenerate').onclick = function() {Gen.addModalContent(name,num);};

  //Make all of the changes visible.
  document.getElementById('ModalBackground').style.display = "block";
}

Gen.addModalContent = function(name, num) {
  //Call generator prep functions
  var nmlist = Gen.loadGenerationArray(name);
  var language = Gen.loadGenerationArray('genLanguage');

  var list = Gen[name](nmlist, language, num);

  //Now that we have a list loop over them and add making them clickable to copy.
  document.getElementById('GeneratorModalResults').innerHTML = ""; //Clear the results.
  for(var i = 0; i < list.length; i++) {
    document.getElementById('GeneratorModalResults').innerHTML += "<span onclick=\"CT.setClipboard('" + list[i] + "')\">" + list[i] + "</span><br/>";
  }
}

Gen.loadGenerationArray = function(name) {
  return document.getElementById(name).innerHTML.split(/\n/).map(function(e) {return e.split(/,/);});
}

//Gender is ignored for Genasi Names.
Gen.genGenasiName = function(nmlist, language, num, gender) {
  var ret = [];
  var tempName;
  var rn1;
  var rn2;
  //Loop the necessary times.
  while(ret.length < num) {
    rn1 = (Math.floor(Math.random()*nmlist.length) || 0);
    rn2 = (Math.floor(Math.random()*nmlist[rn1].length) || 0);
    tempName = nmlist[rn1][rn2];
    if (ret.indexOf(tempName) < 0) {
      ret.push(tempName);
    }
  }
  return ret;
}

Gen.genHumanName = function(nmlist, language, num, gender) {
  //Make sure that we receive the parameters appropriately.
  num = num || 1;
  gender = gender || 0;

  //Initialize all of the required variables.
  var ret=[];
  var ary;
  var tempName;
  var tempSurName;
  var rn1;
  var rn2;
  var unique = 0;

  //Loop until we have the correct number of names;
  while (ret.length < num) {

    //Determine the name time to generate
    rn1 = Gen.randInt(16);

    //Determine the gender of the name to generate.
    if (gender == 0) {
      rn2 = Gen.randInt(2)+1;
    } else {
      rn2 = gender;
    }

    //Generate the tempSurName;
    unique = 0;
    useary = [];
    switch(rn1) {
      case 0:
      case 1:
        ary = [8,9,10,9,11];
        break;
      case 2:
      case 3:
        ary = [20,21];
        unique = 1;
        break;
      case 4:
        ary = [29,30,32];
        break;
      case 5:
        ary = [29,30,31,30,32];
        break;
      case 6:
      case 7:
        ary = [20,21];
        unique = 1;
        break;
      case 8:
        ary = [49,50,51,50,51,50,52];
        break;
      case 9:
        ary = [49,50,51,50,52];
        break;
      case 10:
        ary = [61,62,63,62,63,62,63,62];
        break;
      case 11:
        ary = [61,62,63,62,63,62];
        break;
      case 12:
      case 13:
        ary = [69,70,71];
        for (var i = 0; i < 3; i++) {
          useary.push(Gen.randInt(nmlist[ary[i]].length));
          if ((i == 2) && (useary[2] < 3)) {
            while(useary[0] < 3) {
              useary[0] = Gen.randInt(nmlist[ary[i]].length);
            }
          }
        }
        break;
      default:
        ary = [79,13,80,13,80,13,81];
    }

    tempSurName = Gen.buildName(ary, useary, unique, nmlist);

    //Generate the first name.
    useary = [];
    unique = 0;
    if (rn2 == 1) {   //Female
      switch(rn1) {
        case 0:
          ary = [4,5,6,5,6,5,7];
          break;
        case 1:
          ary = [4,5,6,5,7];
          break;
        case 2:
          ary = [16,17,18,17,18,17,19];
          break;
        case 3:
          ary = [16,17,18,17,19];
          break;
        case 4:
          ary = [26,23,27,23,28];
          break;
        case 5:
          ary = [26,23,28];
          break;
        case 6:
          ary = [37,23,38,23,38,23,39];
          break;
        case 7:
          ary = [37,23,38,23,39];
          break;
        case 8:
          ary = [46,13,47,13,47,13,48];
          break;
        case 9:
          ary = [46,13,47,13,48];
          break;
        case 10:
          ary = [57,58,59,58,59,58,60];
          break;
        case 11:
          ary = [57,58,59,58,60];
          break;
        case 12:
        case 13:
          ary = [67,68];
          break;
        case 14:
          ary = [76,77,78,76,78,76];
          break;
        default:
          ary = [76,77,78,76];
          break;
      }
    } else {          //Male
      switch(rn1) {
        case 0:
        case 1:
          ary = [0,1,2,1,3];
          break;
        case 2:
        case 3:
          ary = [12,13,14,13,15];
          for (var i = 0; i < 5; i++) {
            useary.push(Gen.randInt(nmlist[ary[i]].length));
          }
          if (useary[4] < 3) {
            useary[2] = 0;
          } else {
            while(useary[2] == 0) {
              useary[2] = Gen.randInt(nmlist[ary[2]].length);
            }
          }
          break;
        case 4:
          ary = [22,23,24,23,25];
          break;
        case 5:
          ary = [22,23,25];
          break;
        case 6:
          ary = [33,34,35,34,36];
          break;
        case 7:
          ary = [33,34,36];
          break;
        case 8:
          ary = [42,43,44,43,44,43,45];
          break;
        case 9:
          ary = [42,43,44,43,45];
          break;
        case 10:
          ary = [53,54,55,54,55,54,55];
          break;
        case 11:
          ary = [53,54,55,54,56];
          break;
        case 12:
        case 13:
          for (var i = 0; i < 3; i++) {
            useary.push(Gen.randInt(nmlist[ary[i]].length));
            if ((i == 2) && (useary[2] < 3)) {
              while(useary[0] < 2) {
                useary[0] = Gen.randInt(nmlist[ary[i]].length);
              }
            }
          }
          break;
        case 14:
          ary = [72,73,74,73,74,73,75];
          break;
        default:
          ary = [72,73,74,73,75];
          break;
      }
    }

    tempName = Gen.buildName(ary, useary, unique, nmlist);

    //If we find that the name has language in it try again.
    tempName = Gen.LANGUAGE((tempName + " " + tempSurName), language);
    if (tempName == "") { continue; }

    //Add the name to the list.
    ret.push(Gen.toTitleCase(tempName) + ((rn2 == 1) ? ' (F)' : ' (M)'));
  }

  return ret;
}

Gen.genDwarfName = function(nmlist, language, num, gender) {
  //Make sure that we receive the parameters appropriately.
  num = num || 1;
  gender = gender || 0;

  //Initialize all of the required variables.
  var ret=[];
  var rn1;
  var rn2;
  var ary;
  var useary;
  var tempName;
  var tempSurName;

  while (ret.length < num) {
    if (gender == 0) {
      rn2 = Gen.randInt(2)+1;
    } else {
      rn2 = gender;
    }

    //Generate Last Name
    rn1 = Gen.randInt(3);
    switch(rn1) {
      case 0:
        ary = [8,9,11];
        break;
      case 1:
        ary = [12,13];
        break;
      default:
        ary = [8,9,10,9,11];
        break;
    }

    //Build last name.
    tempSurName = Gen.buildName(ary, [], 0, nmlist);

    //Generate the First name.
    rn1 = Gen.randInt(2);
    useary = []
    if (rn2 == 1) {
      switch (rn1) {
        case 0:
          ary = [4,5,7];
          for (var i = 0; i < 3; i++) {
            useary.push(Gen.randInt(nmlist[ary[i]].length));
            if (i == 0) {
              while (useary[0] < 6) {
                useary[0] = Gen.randInt(nmlist[ary[i]].length);
              }
            }
          }
          break;
        default:
          ary = [4,5,6,5,7];
      }
    } else {
      switch (rn1) {
        case 0:
          ary = [0,1,3];
          break;
        default:
          ary = [0,1,2,1,3];
      }
    }

    //Build first name.
    tempName = Gen.buildName(ary, useary, 0, nmlist);

    //Check language.
    tempName = Gen.LANGUAGE(tempName + " " + tempSurName, language);

    if (tempName == "") { continue; }

    ret.push(Gen.toTitleCase(tempName) + ((rn2 == 1) ? ' (F)' : ' (M)'));
  }

  return ret;
}

Gen.genElfName = function(nmlist, language, num, gender) {
  //Make sure that we receive the parameters appropriately.
  num = num || 1;
  gender = gender || 0;

  //Initialize all of the required variables.
  var ret=[];
  var rn1;
  var rn2;
  var ary;
  var useary;
  var tempName;
  var tempSurName;

  while (ret.length < num) {
    if (gender == 0) {
      rn2 = Gen.randInt(2)+1;
    } else {
      rn2 = gender;
    }

    //Generate Last Name
    rn1 = Gen.randInt(3);
    useary = [];
    switch(rn1) {
      case 0:
        ary = [8,9,10,9,11];
        break;
      case 1:
        ary = [8,9,10,9,10,9,11];
        break;
      default:
        ary = [8,9,11];
        for (var i = 0; i < 3; i++) {
          useary.push((Math.floor(Math.random()*nmlist[ary[i]].length) || 0));
          if (i == 0) {
            while (useary[i] < 4) {
              useary[i] = (Math.floor(Math.random()*nmlist[ary[i]].length) || 0);
            }
          }
          if (i == 2) {
            while (useary[i] < 2) {
              useary[i] = (Math.floor(Math.random()*nmlist[ary[i]].length) || 0);
            }
          }
        }
    }

    tempSurName = Gen.buildName(ary, useary, 0, nmlist);

    //Generate first Name
    useary = []; //Reset
    if (rn2 == 1) {   //Female
      rn1 = Gen.randInt(3);
      switch (rn1) {
        case 0:
          ary = [4,5,6,5,7];
          break;
        case 1:
          ary = [4,5,6,5,6,5,7];
          break;
        default:
          ary = [4,5,6,5,6,5,6,5,7];
          break;
      }
    } else {          //Male
      rn1 = Gen.randInt(4);
      switch (rn1) {
        case 0:
          ary = [0,1,3];
          for (var i = 0; i < 3; i++) {
            useary.push(Gen.randInt(nmlist[ary[i]].length));
            if (i == 0) {
              while (useary[i] < 5) {
                useary[i] = Gen.randInt(nmlist[ary[i]].length);
              }
            }
            if (i == 2) {
              while (useary[i] == 0) {
                useary[i] = Gen.randInt(nmlist[ary[i]].length);
              }
            }
          }
          break;
        case 1:
          ary = [0,1,2,1,3];
          break;
        case 2:
          ary = [0,1,2,1,2,1,3];
          break;
        default:
          ary = [0,1,2,1,2,1,2,1,3];
          break;
      }
    }

    tempName = Gen.buildName(ary, useary, 0, nmlist);
    tempName = Gen.LANGUAGE(tempName + " " + tempSurName, language);

    if (tempName == "") { continue; }

    ret.push(Gen.toTitleCase(tempName) + ((rn2 == 1) ? ' (F)' : ' (M)'));
  }

  return ret;
}


//Generates a name from the loaded name lists and the list of name lists to pick from. (Assumes that the language array has been populated)
//ary = In order array of the list indexes to generate the name from.
//useary = pregenerated random number array for names requiring random numbers with dependancies.
//      Sould NOT be used at the same time as the unique parameter.
//unique = forces the random numbers found to be unique. (Can cause infinite loop of you define a name with more parts than options.)
//      Sould NOT be used at the same time as the useary parameter.
Gen.buildName = function(ary, useary, unique, nmlist) {
  var ret = "";
  var rna = [];
  var rn;

  //loop over the total list of name parts and add them.
  for (var i = 0; i < ary.length; i++) {
    //Allow random number generation to be dependent on itself
    if (useary.length > 0) {
      rn = useary[i];
    } else {
      rn = Gen.randInt(nmlist[ary[i]].length);
    }

    //If we want each entry to be unique then we should keep track of old entries.
    if (unique) {
      while (rna.indexOf(rn) >= 0) {
        rn = Gen.randInt(nmlist[ary[i]].length);
      }
      rna.push(rn);
    }

    //Add up the name
    ret += nmlist[ary[i]][rn];
  }

  return ret;
}

Gen.randInt = function(num) { return (Math.floor(Math.random()*num) || 0); }

Gen.toTitleCase = function(text) {
  return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//Make sure that our name passes the Steve Rogers test.
Gen.LANGUAGE = function(test, language) {
  if (language[0].indexOf(test) >= 0) {
    return "";
  }
  return test;
}
