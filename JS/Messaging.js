/*
  Messaging through Discord connections.

  Author: HAJ523
  2019-01 Created.
*/

var MG = {};

MG.onload = function() {
  //MG.client = new Discord.Client();

  //MG.client.on('message', MG.pong);

  //MG.client.login(""); //TODO MAKE SURE THAT THIS GETS REMOVED IN A RELEASE VERSION!
}

/*
  Scope: Restricted (Messaging)
  Description: Parse messages to determine if a command was executed.
*/
MG.parseMessage = function(m) {
  var idx = m.content.indexOf(' ');
  var cmd = ((idx > -1) ? m.content.substring(1,idx) : m.content.substring(1)).toLowerCase(); //Grab the first word if there is one.

  //Only allow processing if we started with the Key //TODO Make key configurable in bot options.
  if (cmd.indexOf('?') == 0) {
    cmd = cmd.substring(1); //Remove the special beginning.
    //Check for standard bot functions
    switch (cmd) {
      case "m":
      case "macro":
        var ret = MG.macros(m.content);
        var em = {embed: {
          color: 0x00ffff,
          title: "Macro " + ((ret[0]) ? "Success" : "Failure"),
          description: ret[1],
          timestamp: new Date()
        }};
        if (ret[0] == "Success") { em.embed.fields = [{name: "Usage", value: ret[2]}]; }
        m.channel.send(em);
        break;

      case "r":
      case "roll":

        break;
    }
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
  Returns:  Array[0] = 1 - Success | 0 - Failure
            Array[1] = "Macro Code" | "Failure Reason"
            Array[2] = "Usage" ie ?new_macro
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
