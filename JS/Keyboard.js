/*
  Keyboard handling.

  Author: HAJ523
  2019-01 Created.

  UNUSED SHORTCUT KEYS: DFG7890
  Keys to Skip: ZYXCVA
*/

var KB = {}; //Initialize keyboard object.

/*
  Scope: Restricted (CampaignTracker.js)
  Description: Loading function for the keyboard support.
*/
KB.onLoad = function() {
  window.addEventListener("keydown", KB.keyUD);
  window.addEventListener("keyup", KB.keyUD);

  KB.modKeys = {};
}

/*
  Scope: Restricted (CT3.html)
  Description: Register all updown key events to check for application specific quick keys and record mod key pressed state.
  Mod Keys Used: P,J,M,E,S,O
*/
KB.keyUD = function(e) {
  var key = e.which || e.keyCode;
  console.log(key);

  switch(key) {
    case 16: //Shift
    case 17: //Control
    case 18: //Alt
      KB.modKeys[key] = (e.type == 'keydown');
      break;
    default:
      if (KB.modKeys[16]) break;
      if (KB.modKeys[18]) break;
      if (KB.modKeys[17] && e.type == 'keydown') { //Cntrl
        switch (key) {
          case 80:
            CT.prompt(CT.newPage,'New Page','Enter the full page path and name:','Page Path','Ex. \'Parent/Sub Parent/Page Name\'');
            e.preventDefault();
            break;
          case 74:
          case 77:
          case 69:
            CT.changeView(String.fromCharCode(key));
            e.preventDefault();
            break;
          case 83:
            CT.saveData();
            e.preventDefault();
            break;
          case 79:
            CT.prompt(CT.loadData,'Load Campaign','What campaign do you wish to load?','Campaign','Campaign Name');
            e.preventDefault();
            break;
        }
      }
  }
}

/*
  Scope: Public
  Description: Handle the special input to the prompt such as escape and enter so that the user doesn't have to click the buttons.
*/
KB.prompt = function(e,cb) {
  var key = e.which || e.keyCode;
  if (key == 27) {
    cb(0);
  }
  if (key == 13) {
    cb(1);
  }
}

/*
  Scope: Public
  Description: Specific key handling for the journal editor.
  Mod Keys Used: 1,2,3,4,5,6,B,I,U,L,H,D,Q,K,R
*/
KB.markdownShortcut = function(e) {
  var key = e.which || e.keyCode;

  switch(key) {
    case 113: //f2
      JL.selectNextHotText(e.currentTarget);
      return;
      break;
    case 9: //Tab
      JL.insertTab(e.currentTarget);
      e.preventDefault();
      break;
  }

  if (KB.modKeys[16]) return;
  if (KB.modKeys[18]) return;
  if (KB.modKeys[17]) { //Control + Key
    switch(key) {
      case 49: //1
        JL.headerText(e.currentTarget, 1);
        e.preventDefault();
        break;
      case 50: //2
        JL.headerText(e.currentTarget, 2);
        e.preventDefault();
        break;
      case 51: //3
        JL.headerText(e.currentTarget, 3);
        e.preventDefault();
        break;
      case 52: //4
        JL.headerText(e.currentTarget, 4);
        e.preventDefault();
        break;
      case 53: //5
        JL.headerText(e.currentTarget, 5);
        e.preventDefault();
        break;
      case 54: //6
        JL.headerText(e.currentTarget, 6);
        e.preventDefault();
        break;
      case 66: //B
        JL.boldText(e.currentTarget);
        e.preventDefault();
        break;
      case 73: //I
        JL.italicText(e.currentTarget);
        e.preventDefault();
        break;
      case 85: //U
        JL.underlineText(e.currentTarget);
        e.preventDefault();
        break;
      case 82: //R
        JL.strikethroughText(e.currentTarget);
        e.preventDefault();
        break;
      case 75: //K //Ordered List
        JL.listText(e.currentTarget, "+");
        e.preventDefault();
        break;
      case 76: //L //Unordered List
        JL.listText(e.currentTarget, "*");
        e.preventDefault();
        break;
      case 72: //H
        JL.horizontalRule(e.currentTarget);
        e.preventDefault();
        break;
      case 68: //D
        JL.insertTable(e.currentTarget, 3, 3);
        e.preventDefault();
        break;
      case 81: //Q //Blockqoute
        JL.blockquoteText(e.currentTarget);
        e.preventDefault();
        break;
    }
  }
}

/*
  Scope: Public
  Description: Prevent all entries except digits. (Allows only positive integers to be entered into field.)
*/
KB.posIntInputOnly = function(e) {
  if(!((e.keyCode > 95 && e.keyCode < 106)
    || (e.keyCode > 47 && e.keyCode < 58)
    || e.keyCode == 8 || e.keyCode == 9)) {
      e.preventDefault(); //Need this for some reason...
      return false;
  }
}
