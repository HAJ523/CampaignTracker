/*
  Keyboard handling.

  Author: HAJ523
  2019-01 Created.

  UNUSED SHORTCUT KEYS: DFG7890
  Keys to Skip: ZYXCV
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
    case 17: //Control
    //case 18: //Alt
      KB.modKeys[key] = (e.type == 'keydown');
      break;
    default:
      if (KB.modKeys[17] && e.type == 'keydown') {
        switch (key) {
          case 80:
            console.log("new page!");
            CT.prompt(CT.newPage,'New Page','Enter the full page path and name:','Page Path','Ex. \'Parent/Sub Parent/Page Name\'');
            break;
          case 74:
          case 77:
          case 69:
            CT.changeView(String.fromCharCode(key));
            break;
          case 83:
            CT.saveData();
            break;
          case 76:
            CT.prompt(CT.loadData,'Load Campaign','What campaign do you wish to load?','Campaign','Campaign Name');
            break;
        }
        e.preventDefault();
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
  Mod Keys Used: 1,2,3,4,5,6,B,I,U,L,H,A,Q,K,R
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

  if (KB.modKeys[17]) { //Control + Key
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
      case 82: //R
        JL.strikethroughText(e.currentTarget);
        break;
      case 75: //K //Ordered List
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
    e.preventDefault();
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
