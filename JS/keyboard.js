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
KB.journalEditor = function(e) {
  var key = e.which || e.keyCode;

  if (key == 113) {
    JL.selectNextHotText();
    return;
  }

  if (KB.modKeys[18]) {
    switch(key) {
      case 49:  //Headings
        JL.headerText(1);
        break;
      case 50:
        JL.headerText(2);
        break;
      case 51:
        JL.headerText(3);
        break;
      case 52:
        JL.headerText(4);
        break;
      case 53:
        JL.headerText(5);
        break;
      case 54:
        JL.headerText(6);
        break;
      case 66: //Bold
        JL.boldText();
        break;
      case 73: //Italic
        JL.italicText();
        break;
      case 85: //Underline
        JL.underlineText();
        break;
      case 83: //Strike Through
        JL.strikethroughText();
        break;
      case 84: //Insert Tab
        JL.insertTab();
        break;
      case 79: //Ordered List
        break;
      case 76: //Unordered List
        break;
      case 72: //Horizontal Rule
        JL.horizontalRule();
        break;
      case 65: //Table
        JL.insertTable(3,3);
        break;
      case 81: //Blockqoute
        break;
      case 67: //Code
        break;
      case 80: //Insert Template
        break;

    }
  }
}
