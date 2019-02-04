/*
  Quick notes display and functions.

  Author: HAJ523
  2019-01 Created.
*/

var QN = {};

/*
  Scope: Public
  Description: Remove a quick note.
*/
QN.deleteNote = function(id) {
  var link = document.getElementById('MN' + id);
  var note = document.getElementById('Note' + id);
  link.parentElement.removeChild(link);
  note.parentElement.removeChild(note);
}

/*
  Scope: Public
  Description: Minimizes the note to the bottom bar.
*/
QN.minimizeNote = function(id) {
  document.getElementById("MN" + id).classList.remove('w3-hide');
  document.getElementById('Note' + id).classList.add('w3-animate-zoom-r');
}

/*
  Scope: Public
  Description: Maximizes the note from the bottom bar.
*/
QN.maximizeNote = function(id) {
  document.getElementById('MN' + id).classList.add('w3-hide');
  var note = document.getElementById('Note' + id);
  note.classList.add("w3-animate-zoom");
  note.classList.remove('w3-hide');
}

/*
  Scope: Restricted (QuickNotes.js)
  Description: Update the animation CSS attached to the HTML when the animations are complete.
*/
QN.animationEnd = function() {
  if (this.classList.contains("w3-animate-zoom")) {
    this.classList.remove("w3-animate-zoom");
  }
  if (this.classList.contains("w3-animate-zoom-r")) {
    this.classList.add("w3-hide");
    this.classList.remove("w3-animate-zoom-r");
  }
}

/*
  Scope: Public
  Description: Create a new QuickNote
*/
QN.newNote = function() {
  var master = document.getElementById('QuickNoteTemplate')
  master.title = parseInt(master.title,10)+1; //Increment the note number.
  var template = master.cloneNode(true);
  var notes = document.getElementById('Notes');
  var id = CT.GUID(8);

  //Modify the IDs and make visible.
  template.id = "Note" + id;
  template.getElementsByClassName("w3-theme-d3")[0].id = "Note" + id + "Header";
  template.getElementsByClassName("fa-sync")[0].href = 'javascript:QN.minimizeNote("' + id + '");';
  template.getElementsByClassName("fa-window-minimize")[0].href = 'javascript:QN.minimizeNote("' + id + '");';
  template.getElementsByClassName("fa-trash-alt")[0].href = 'javascript:QN.deleteNote("' + id + '");';
  template.getElementsByClassName("w3-display-middle")[0].innerHTML = template.title;
  template.classList.add("w3-animate-zoom");
  template.classList.remove("w3-hide");

  notes.appendChild(template);
  QN.makeDraggable(template);
  template.addEventListener('animationend', QN.animationEnd);

  var temp = document.createElement("template");
  temp.innerHTML = '<a href="javascript:QN.maximizeNote(\'' + id + '\');" class="w3-button w3-padding-small w3-tiny w3-hide" id="MN' + id + '">' + template.title + '</a>';
  document.getElementById('QuickNotesList').appendChild(temp.content.firstChild);
}

/*
  Scope: Restricted (QuickNotes.js)
  Description: Moves the current child to the top of the list.
*/
QN.topNote = function(el) {
  document.getElementById('Notes').append(el);
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
    if (e.currentTarget != e.target) return;
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
