/*
  Messaging through Discord connections.

  Author: HAJ523
  2019-01 Created.
*/

var MG = {};

MG.onload = function() {
  MG.client = new Discord.Client();

  MG.client.on('message', MG.pong);

  MG.client.login(""); //TODO MAKE SURE THAT THIS GETS REMOVED IN A RELEASE VERSION!
}

//Simple test messaging.
MG.pong = function(msg) {
  if (msg.content.startsWith('ping')) {
    msg.channel.send("pong!");
  }
}
