/*
  Audio playing scripts.

  Author: HAJ523
  2019-07 Created.
*/

var AU = {}; //Initialize markdown object.

AU.onLoad = function() {
  AU.PL = []; //Make sure we have a new playlist ready!
  AU.EF = []; //Make a list of effect objects.
}

AU.newEffect = function(s, t, v, l) {//Source, Title, Looping/Interval

  //Make sure that variables are set!
  v = ((v=="")? 1:v/100);
  l = parseInt(((l==undefined)? "":l));

  var snd = {v:v, l:l};

  snd.h. = new Howl({src:[s], volume:v});

  //Add new array entry to Effects.
  AU.EF.push(snd);
  var id = (AU.EF.length - 1);

  var par = document.getElementById("SoundEffects");
  var el = document.getElementById("EffTemp").cloneNode(1);

  el.id = "E" + id;
  el.children[0].href = "javascript:AU.deleteEffect('" + id + "')";
  el.children[1].innerHTML = t;
  el.children[2].children[0].onclick = AU.playStop; // Play/Stop
  el.children[2].children[1].onclick = AU.mute; // Mute/Volume
  el.children[2].children[2].onchange = AU.volume; // Volume
  el.children[2].children[2].value = Math.floor(v*100);

  par.appendChild(el); //Append to the list.

  //Interval
  if (l > 1) {
    snd.h.on('end', ()=>{AU.endInterval(id);});
  }
  //Loop
  if (l == 1) {
    snd.h.once('load',()=>{
      snd.h.sprite={'loop':[0,snd.h.duration()]};
      snd.hid = snd.h.play('loop');
    });
    return; //Nothing else to do since the looping start play.
  }
  //Once
  if (l < 1) {
    snd.h.once('end',()=>{
      AU.deleteEffect(id);
    });
  }

  //Start Playing
  snd.hid = snd.h[0].play(); //Save the play id from howler.
}

AU.deleteEffect = function(i) {//ID
  var el = document.getElementById('E'+i);
  el.parentElement.removeChild(el);

  AU.EF[i].h.unload();

  if (AU.EF[i].t != undefined) {

  }

  delete AU.EF[i];
}

AU.endInterval = function(i) {//Audio ID
  //Stop track & reset.
  AU.EF[i].h.stop();

  AU.EF[i].t = setTimeout(()=>{AU.EF[i].hid = AU.EF[i].h.play();},Math.floor((AU.EF[i].l*1000)*(Math.random()*.2-.4))); // +/- 20% of interval to restart play.
}

AU.fadeIn = function(i) {//Audio ID

}
