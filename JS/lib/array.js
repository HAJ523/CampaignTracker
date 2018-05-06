Arylib = {};

//Insert an element into a sorted array.
Arylib.insert = function(element, array, valfn) {
  var index = Arylib.locationOf(element, array, valfn) + 1;
  array.splice(index, 0, element);
  if (array.length == 1) { index = 0;}
  return [array, index];
}

//Find the location where the insertion should happen.
Arylib.locationOf = function(element, array, valfn, start, end) {
  start = start || 0;
  end = end || array.length;
  valfn = valfn || function(e) {return e;}; //Default function is to just use the value.
  var pivot = parseInt(start + (end - start) / 2, 10);
  if (end - start <= 1 || valfn(array[pivot]) === valfn(element)) return pivot;
  if (valfn(array[pivot]) < valfn(element)) {
    return Arylib.locationOf(element, array, valfn, pivot, end);
  } else {
    return Arylib.locationOf(element, array, valfn, start, pivot);
  }
}

//Will return -1 if element not found.
Arylib.locate = function(element, array, valfn, start, end) {
  start = start || 0;
  end = end || array.length;
  valfn = valfn || function(e) {return e;}; //Default function is to just use the value.
  var pivot = parseInt(start + (end - start) / 2, 10);
  if (valfn(array[pivot]) === valfn(element)) return pivot; //If our pivot element is the correct one return it.
  if (end - start <= 1) return -1; //there are no more elements to search.
  if (valfn(array[pivot]) < valfn(element)) {
    return Arylib.locationOf(element, array, valfn, pivot, end);
  } else {
    return Arylib.locationOf(element, array, valfn, start, pivot);
  }
}
