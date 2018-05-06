var Keyboard = {};
Keyboard.KMap = {};
window.onkeydown = window.onkeyup = function(e) {
  e = e || event;
  Keyboard.KMap[e.key] = (e.type == 'keydown');


  //Check for multikey press (Alt)
  if (Keyboard.KMap['Alt']) {
    //console.log('Alt + ' + e.key);
    event.preventDefault(); //Make sure that we don't do the default action when these keys are pressed.
    //Alt+N = New Page
    if (Keyboard.KMap['n']) {
      CT.newPageModal();
      return;
    }
    //Alt+S = Settings
    if (Keyboard.KMap['s']) {
      CT.settings();
      return;
    }
    //Alt+Left = Back
    if (Keyboard.KMap['ArrowRight']) {
      CT.goForward();
      return;
    }
    //Alt+Right = Forward
    if (Keyboard.KMap['ArrowLeft']) {
      CT.goBack();
      return;
    }
  }

  //console.log(e.key);
  //Alt+M = Map View Current Page
  //Alt+C = Calendar
  //Alt+J = Journal View Current Page
  //Alt+G = Generators List //This might be better served as a list below the page list.
  //Alt+F = Toggle Favorite on open page.
  //Alt+L = execute the loading a file press. Will require a phantom key press.
  //Alt+A = About

  if (e.key == '~') {
    alert(document.getElementById('wikitext').selectionStart);
    event.preventDefault();
  }

  /*var str = ""
  for (var key in Keyboard.KMap) {
    if (Keyboard.KMap[key]) {
      if (str.length > 0) {str += "+";}
      str += "'"+key+"'";
    }
  }

  alert(str);*/

}
