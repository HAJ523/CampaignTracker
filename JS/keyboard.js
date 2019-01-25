/*
  Keyboard handling.

  Author: HAJ523
  2019-01 Created.
*/

var KB = {}; //Initialize markdown object.

/*
  Scope: Public
  Description: Handle the special input to the prompt such as escape and enter so that the user doesn't have to click the buttons.
*/
KB.prompt = function(e) {
  var key = e.which || e.keyCode;
  console.log(key);
  if (key == 27) {
    CT.promptClose(0);
  }
  if (key == 13) {
    CT.promptClose(1);
  }
}

KB.journalEditor = function(e) {
  var key = e.which || e.keyCode;

  if (key == 113) {
    JL.selectNextHotText();
  }
}
