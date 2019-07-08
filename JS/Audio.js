/*
  Audio playing scripts.

  Author: HAJ523
  2019-07 Created.
*/

var AU = {}; //Initialize markdown object.

AU.onLoad = function() {
  AU.MS;
  AU.PL = []; //Make sure we have a new playlist ready!
  AU.EF = []; //Make a list of effect objects.
}

AU.newPlaylist = (s)=> {
  var l = s.split("|");
  AU.PL = []; //Reset playlist!
  for (var i=0;i<l.length;i++) {
    l[i].replace(/^(([^\.]*)\..{3})(?:\ (\d*))?$/g,(m,a,b,c)=>{
      c = ((c==undefined)? 100:c/100);
      AU.PL.push({s:"..\\Music\\"+a,t:b,v:c});
    });
  }

  AU.endSong(); //End the current song and move to the next which will start this playlist.
}

AU.newEffects = (s)=> {
  var l = s.split("|");
  for (var i=0;i<l.length;i++) {
    l[i].replace(/^(([^\.]*)\..{3})(?:\ (\d*))?(?:\ (\d*))?$/g,(m,a,b,c,d)=>{
      AU.newEffect(a,b,c,d);
    });
  }
}

AU.newEffect = function(s, t, v, l) {//Source, Title, Volume, Looping/Interval

  //Make sure that variables are set!
  v = ((v=="")? 1:v/100);
  l = parseInt(((l==undefined)? 0:l));

  var snd = {v:v, l:l};

  snd.h = new Howl({src:["..\\Effects\\"+s], volume:v, html5:true, onload:()=>{
    if (l!=1) {return;}
    snd.h._sprite.loop = [0,snd.h.duration()*1000,1];
    snd.h.loop(1);
    snd.hid = snd.h.play('loop');
  }});

  //Add new array entry to Effects.
  AU.EF.push(snd);
  var id = (AU.EF.length - 1);

  var par = document.getElementById("SoundEffects");
  var el = document.getElementById("EffTemp").cloneNode(1);

  el.id = "E" + id;
  el.classList.remove('w3-hide');
  el.children[0].href = "javascript:AU.deleteEffect('" + id + "')";
  el.children[1].innerHTML = t;
  el.children[2].children[0].onclick = AU.playStop; // Play/Stop
  el.children[2].children[1].onclick = AU.mute; // Mute/Volume
  el.children[2].children[2].onchange = AU.volume; // Volume
  el.children[2].children[2].value = Math.floor(v*100);

  par.appendChild(el); //Append to the list.

  //Interval
  if (l > 1) {
    snd.h.on('end', ()=>{
      AU.endInterval(id);
    });
    AU.endInterval(id);
    return;
  }
  //Loop
  if (l == 1) {
    return; //Nothing else to do since the looping start play.
  }
  //Once
  snd.h.once('end', ()=>{
    AU.deleteEffect(id);
  });

  //Start Playing
  snd.hid = snd.h.play(); //Save the play id from howler.
}

AU.deleteAllEffects = ()=> {
  for (var i=0;i<AU.EF.length;i++) {
    if (AU.EF[i] == undefined) {continue;} //Skip undefined entries.
    AU.deleteEffect(i);
  }
  AU.EF = []; //Reset the effect array.
}

AU.deleteEffect = function(i) {//ID
  var el = document.getElementById('E'+i);
  el.parentElement.removeChild(el);

  AU.EF[i].h.unload();

  if (AU.EF[i].t != undefined) {
    clearTimeout(AU.EF[i].t);
  }

  delete AU.EF[i];
}

AU.endSong = function() {
  var nxt = AU.PL.shift(); //Get the first element off the list.
  if (AU.MS != undefined) {AU.MS.unload();}
  AU.MS = new Howl({src:nxt.s,volume:0, html5:true,onload:()=>{AU.MS.play();AU.MS.fade(0,nxt.v,2000)},onend:AU.endSong});
  document.getElementById('MusicTitle').innerHTML = nxt.t;
  AU.PL.push(nxt); //push it back onto the end for next time around.
}

AU.endInterval = function(i) {//Audio ID
  //Stop track & reset.
  AU.EF[i].h.stop();

  AU.EF[i].t = setTimeout(()=>{AU.EF[i].hid = AU.EF[i].h.play();},Math.floor((AU.EF[i].l*1000)*(Math.random()*.4+.8))); // +/- 20% of interval to restart play.
}

AU.playStop = (e)=> {
  var s = AU.eventToSnd(e); //Get audio object.

  if (e.currentTarget.checked) {
      s.hid = s.h.play(((s.l == 1)? 'loop':'')); //Start play passing loop if looping sound.
  } else {
    //Stop the sound, Remove the timeout
    s.h.stop();
    if (s.t != undefined) {
      clearTimeout(s.t);
    }
  }
}

AU.mute = (e)=> {
  var s = AU.eventToSnd(e); //Get audio id.

  if (e.currentTarget.checked) { //Whether we are muting or unmuting.
    s.h.volume(s.v,s.hid);
  } else {
    s.h.volume(0,s.hid);
  }
}

AU.volume = (e)=> {
  var s = AU.eventToSnd(e); //Get audio id.

  s.v = e.currentTarget.value/100;

  s.h.volume(s.v,s.hid);
}

AU.eventToSnd = (e)=>{
  var str = e.target.parentElement.parentElement.id;
  if (str == 'Music') {
    return AU.MS; //Just return the current music.
  }
  return AU.EF[parseInt(str.slice(1))];
}

AU.fadeIn = function(i) {//Audio ID

}
