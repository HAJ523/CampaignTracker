//Used the handle mouse input when on the map.
var Mouse = {};
Mouse.MMap = {};
Mouse.Coord = {};

Mouse.down = function(e) {
  Mouse.MMap[e.button] = true;
  Mouse.Coord[e.button] = {};
  Mouse.Coord[e.button].x = e.x;
  Mouse.Coord[e.button].y = e.y;

}

Mouse.up = function(e) {
  //Perform the action associated with this.
  if (Mouse.MMap[1]) {
    data.map.x =
  }

  Mouse.MMap[e.button] = false;
}
