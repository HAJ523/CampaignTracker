/*
  Quick notes display and functions.

  Author: HAJ523
  2019-01 Created.
*/

var QN = {};

/*
  Scope: Public
  Description: Make an element dragable!
*/
QN.makeDraggable = function(el) {
  var px = 0, py = 0, ipx = 0, ipy = 0;
  if (document.getElementById(el.id + "header")) {
    //If present, the header is where you move the DIV from:
    document.getElementById(el.id + "header").onmousedown = dragMouseDown;
  } else { //Move the DIV from anywhere inside the DIV:
    el.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    ipx = e.clientX;
    ipy = e.clientY;
    document.onmouseup = dragMouseUp;
    // call a function whenever the cursor moves:
    document.onmousemove = drag;
  }

  function drag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    px = ipx - e.clientX;
    py = ipy - e.clientY;
    ipx = e.clientX;
    ipy = e.clientY;
    // set the element's new position:
    el.style.top = (el.offsetTop - py) + "px";
    el.style.left = (el.offsetLeft - px) + "px";
  }

  function dragMouseUp() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
