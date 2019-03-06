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

/*
  Scope: Restricted (Messaging)
  Description: Parse messages to determine if a command was executed.
*/
MG.parseMessage = function(m) {
  //Only allow processing if we started with the Key //TODO Make key configurable in bot options.
  if (m.content.indexOf('?') == 0) {
    //Check for Macros
    //Replace any variables
    //Roll Description & Fields
  }
}

//Simple test messaging.
MG.pong = function(msg) {
  if (msg.content.indexOf('?') == 0) {
    msg.channel.send({embed: {
      color: 3447003,
      title: 'Rolling',
      description: RL.recursiveParse(undefined, msg.content.substring(1)),
      timestamp: new Date()
    }})
  }
  if (msg.content.startsWith('ping')) {
    msg.delete(0); //Delete Immediately!
    msg.channel.send({embed: {
      color: 0x00FFFF,
      title: "Pong",
      description: "Good paddling sir.",
      timestamp: new Date()
    }});
  }
}

/*
  Scope: Restricted (Messaging)
  Description: Handles macro creation / update / deletion.
*/
MG.macros = function(m) {
  //(?:\?m|\?macro) (\S*)     Macro name.
  // /(?:-d (?:['"](.*)['"]|[^\s"']*))/g   Description, text, color or field
}

/*
  Scope: Restricted (Messaging)
  Description: Set or update a user specific variable.
*/
MG.variables = function(m) {
  //  (?:\?v|\?var|\?variable) (\S*) (\S*)   Variable name & Value.
}
