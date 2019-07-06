/*
  Audio playing scripts.

  Author: HAJ523
  2019-07 Created.
*/

var AU = {}; //Initialize markdown object.

AU.onLoad = function() {
  AU.PL = []; //Make sure we have a new playlist ready!
}

AU.newEffect = function(s, t, v, l) {//Source, Title, Looping
  var i = CT.GUID(8); //Create a new ID for this effect.
  var el = document.createElement('div');
  el.classList.add('snd');
  el.id = 'D'+i;
  el.innerHTML = '<span>' + t + '</span><br><a href="javascript:AU.deleteEffect(\'' + i + '\')" class="w3-tiny fas fa-times"></a><audio'+((l)? " loop":"")+((v!="")? ' volume="'+v/100+'"':'')+' controls id="A'+i+'"><source src="' + s + '"></audio>'
  document.getElementById('SoundEffects').appendChild(el);
  el = document.getElementById('A'+i);
  el.play(); //Start element playing!
  el.addEventListener("end",AU.endEffect);
}

AU.deleteEffect = function(i) {//ID
  var el = document.getElementById('D'+i);
  el.parentElement.removeChild(el);
}

AU.endEffect = function() {
  if (this.loop) { return; } //Looping effects should not be deleted!
  AU.deleteEffect(this.id);
}
