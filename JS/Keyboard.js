/*
  Keyboard handling.

  Author: HAJ523
  2019-01 Created.
*/

var KB = {}; //Initialize markdown object.

/*
  Scope: Restricted (CampaignTracker.js)
  Description: Loading function for the keyboard support.
*/
KB.onload = function() {
  window.addEventListener("keydown", KB.keyUD);
  window.addEventListener("keyup", KB.keyUD);

  KB.modKeys = {};
}

/*
  Scope: Restricted (CT3.html)
  Description:
*/
KB.keyUD = function(e) {
  var key = e.which || e.keyCode;
  console.log(key);

  switch(key) {
    case 18: //Alt
      KB.modKeys[key] = (e.type == 'keydown');
    default:
  }
}

/*
  Scope: Public
  Description: Handle the special input to the prompt such as escape and enter so that the user doesn't have to click the buttons.
*/
KB.prompt = function(e) {
  var key = e.which || e.keyCode;
  if (key == 27) {
    CT.promptClose(0);
  }
  if (key == 13) {
    CT.promptClose(1);
  }
}

/*
  Scope: Public
  Description: Specific key handling for the journal editor.
*/
KB.markdownShortcut = function(e) {
  var key = e.which || e.keyCode;

  if (key == 113) {
    JL.selectNextHotText(e.currentTarget);
    return;
  }

  if (KB.modKeys[18]) {
    switch(key) {
      case 49: //1
        JL.headerText(e.currentTarget, 1);
        break;
      case 50: //2
        JL.headerText(e.currentTarget, 2);
        break;
      case 51: //3
        JL.headerText(e.currentTarget, 3);
        break;
      case 52: //4
        JL.headerText(e.currentTarget, 4);
        break;
      case 53: //5
        JL.headerText(e.currentTarget, 5);
        break;
      case 54: //6
        JL.headerText(e.currentTarget, 6);
        break;
      case 66: //B
        JL.boldText(e.currentTarget);
        break;
      case 73: //I
        JL.italicText(e.currentTarget);
        break;
      case 85: //U
        JL.underlineText(e.currentTarget);
        break;
      case 83: //S
        JL.strikethroughText(e.currentTarget);
        break;
      case 84: //T
        JL.insertTab(e.currentTarget);
        break;
      case 79: //O //Ordered List
        JL.listText(e.currentTarget, "+");
        break;
      case 76: //L //Unordered List
        JL.listText(e.currentTarget, "*");
        break;
      case 72: //H
        JL.horizontalRule(e.currentTarget);
        break;
      case 65: //A
        JL.insertTable(e.currentTarget, 3, 3);
        break;
      case 81: //Q //Blockqoute
        JL.blockquoteText(e.currentTarget);
        break;
    }
  }
}
