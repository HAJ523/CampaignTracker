/*
  Quick notes display and functions.

  Author: HAJ523
  2019-01 Created.
*/

var QN = {};

/*
  Scope: Public
  Description: Create a new QuickNote
*/
QN.newNote = function() {
  var template = document.getElementById('QuickNoteTemplate').cloneNode(true);
  var notes = document.getElementById('Notes');
  var id = CT.GUID(8);

  //Modify the IDs and make visible.
  template.id = "Note" + id;
  template.getElementsByClassName("w3-theme-d3")[0].id = "Note" + id + "Header";
  template.classList.remove("w3-hide");

  notes.appendChild(template);
  QN.makeDraggable(template);
}

/*
  Scope: Restricted (QuickNotes.js)
  Description: Moves the current child to the top of the list.
*/
QN.topNote = function(el) {
  var notes = document.getElementById('Notes');
  notes.append(el);
}

/*
  Scope: Public
  Description: Make an element dragable!
*/
QN.makeDraggable = function(el) {
  var px = 0, py = 0, ipx = 0, ipy = 0;
  if (document.getElementById(el.id + "Header")) {
    //If present, the header is where you move the DIV from:
    document.getElementById(el.id + "Header").onmousedown = dragMouseDown;
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

    if (e.currentTarget.id.includes("Header")) {
      QN.topNote(e.currentTarget.parentElement.parentElement);
    } else {
      QN.topNote(e.currentTarget);
    }
  }

  function drag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    px = ipx - e.clientX;
    py = ipy - e.clientY;
    ipx = e.clientX; //TODO check for element going outside the bounds of the screen bottom and right!
    ipy = e.clientY;
    // set the element's new position:
    el.style.top = (((el.offsetTop - py) < 0)? 0 : (el.offsetTop - py)) + "px";
    el.style.left = (((el.offsetLeft - px) < 0)? 0 : (el.offsetLeft - px)) + "px";
  }

  function dragMouseUp() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
