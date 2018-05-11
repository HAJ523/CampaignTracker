//Initialize the calendar
data.cal = {};
data.cal.months = [];
data.cal.weekdays = [];
data.cal.date = {years:0, months:0, days:0, weekday:0, seconds:0, total:0}; //Current Date information as indexes into the arrays.
data.cal.startYear = 0;

var Calendar = {};
Calendar.dayLength = 86400; //Seconds in a day.

Calendar.selectType = function() {
  data.cal.type = parseInt(document.getElementById('csCalType').value);

  //Call function to update the display.
  CT.csCalType();
}

Calendar.setYear = function() {
  var years = parseInt(document.getElementById('csYear').value);

  if (years == "") {
    years = 0;
  }

  data.cal.startYear = years;

  //If this is changed then reset the current date.
  data.cal.date.years = years;
  data.cal.date.months = 0;
  data.cal.date.days = 0;
  data.cal.date.weekday = 0;
  data.cal.date.seconds = 0;
  data.cal.date.total = 0;
  //Also update the display.
  CT.displayGameTime();
}

Calendar.setMonths = function() {
  var months = parseInt(document.getElementById('csMonths').value);

  //Never allow a custom calendar with less than 1 month.
  if (months == "") {
    months = 1;
  }

  //If we have more or less months than previously stored update the array of months.
  if (months > data.cal.months.length) {
    for (var i = data.cal.months.length; data.cal.months.length < months; i++) {
      data.cal.months[i] = {
        name:"Month"+i,
        days:1,
        season:""
      }
    }
  } else if (months < data.cal.months.length) {
    data.cal.months.splice(months,data.cal.months.length-months);
  }

  //Now that we have the array corrected call the selection builder.
  CT.csCalMonthSelect();
}

Calendar.setMonthName = function() {
  var i = parseInt(document.getElementById('csMonthList').value);
  var name = document.getElementById('csMonthName').value;

  //Prevent a null name.
  if (name == "") {
    name = "Month" + i;
  }

  data.cal.months[i].name = name;

  //Finally update the select.
  CT.csCalMonthSelect();
}

Calendar.setMonthDays = function() {
  var i = parseInt(document.getElementById('csMonthList').value);
  var days = parseInt(document.getElementById('csMonthDays').value);

  //Do not allow less than 1 day months.
  if (days < 1) {
    days = 1;
  }

  data.cal.months[i].days = days;
}

Calendar.setWeekdayName = function() {
  var i = parseInt(document.getElementById('csWeekdayList').value);
  var name = document.getElementById('csWeekdayName').value;

  //Prevent a null name.
  if (name == "") {
    name = "Day" + i;
  }

  data.cal.weekdays[i] = name;

  //Finally update the select.
  CT.csCalWeekdaySelect();
}

Calendar.setWeekdays = function() {
  var weekdays = parseInt(document.getElementById('csWeekdays').value);

  //Never allow a custom calendar with less than 1 month.
  if (weekdays == "") {
    weekdays = 1;
  }

  //If we have more or less months than previously stored update the array of months.
  if (weekdays > data.cal.weekdays.length) {
    for (var i = data.cal.weekdays.length; data.cal.weekdays.length < weekdays; i++) {
      data.cal.weekdays[i] = "Day" + i;
    }
  } else if (weekdays < data.cal.weekdays.length) {
    data.cal.weekdays.splice(weekdays, data.cal.weekdays.length - weekdays);
  }

  //Now that we have the array corrected call the selection builder.
  CT.csCalWeekdaySelect();
}

Calendar.incrementDate = function(str) {
  var seconds = 0;

  str.replace(/([\d]*s)/g,function(m,l) {
    seconds+=parseInt(l.substring(0,str.length-1));
    return "";
  }).replace(/([\d]*m)/g,function(m,l) {
    seconds+=parseInt(l.substring(0,str.length-1))*60;
    return "";
  }).replace(/([\d]*h)/g,function(m,l) {
    seconds+=parseInt(l.substring(0,str.length-1))*3600;
    return "";
  }).replace(/([\d]*d)/g,function(m,l) {
    seconds+=parseInt(l.substring(0,str.length-1))*86400;
    return "";
  });

  //If the string contains anything left which is not " " then log a message to the user.
  //TODO

  //Update the total as that is the easiest.
  data.cal.date.total += seconds;

  //Loop and add time as we don't know the structure of the calendar.
  while(seconds > 0) {
    if (seconds + data.cal.date.seconds <= 86399) {
      data.cal.date.seconds += seconds;
      seconds = 0;
      continue;
    }

    //Since there are more seconds than are left in the current day add one day.
    seconds -= (86400-data.cal.date.seconds);
    data.cal.date.seconds = 0; //Reset day to midnight.

    //Handle the day of the week.
    data.cal.date.weekday +=1;
    if (data.cal.date.weekday >= data.cal.weekdays.length) { //We should only ever hit the equals case.
      data.cal.date.weekday = 0
    }

    data.cal.date.days += 1;
    //If we are over the end of the month then increment the month.
    if (data.cal.date.days >= data.cal.months[data.cal.date.months].days) {
      data.cal.date.days = 0;
      data.cal.date.months += 1;

      //If we are at the end of the year then increment the year.
      if (data.cal.date.months >= data.cal.months.length) {
        data.cal.date.months = 0;
        data.cal.date.years += 1;
      }
    }
  }

  //Allow the system to check for events which should alert here!
  //TODO

  //Last make sure that we update the game time display.
  CT.displayGameTime();
}

Calendar.displayDateShort = function() {
  var temp = "";
  var tmp = 0;
  var ret = "";


  temp = "" + data.cal.date.years;
  ret += "" + temp.padStart(4,"0");
  temp = "" + (data.cal.date.months+1);
  ret += "-" + temp.padStart(2,"0");
  temp = "" + (data.cal.date.days+1);
  ret += "-" + temp.padStart(2,"0");
  tmp = Math.floor(data.cal.date.seconds/3600);
  temp = "" + tmp;
  ret += " " + temp.padStart(2,"0");
  temp = "" + Math.floor((data.cal.date.seconds-(tmp*3600))/60);
  ret += ":" + temp.padStart(2,"0");

  return ret;
}

Calendar.displayDateLong = function() {
  var temp = "";
  var tmp = 0;
  var ret = "";

  if (data.cal.weekdays.hasOwnProperty(data.cal.date.weekday)) {
    ret += "" + data.cal.weekdays[data.cal.date.weekday];
  } else {
    ret += "" + data.cal.date.weekday;
  }


  temp = "" + data.cal.date.years;
  ret += " " + temp.padStart(4,"0");
  if (data.cal.months.hasOwnProperty(data.cal.date.months)) {
    ret += " " + data.cal.months[data.cal.date.months].name;
  } else {
    ret += " " + data.cal.date.months;
  }
  temp = "" + (data.cal.date.days+1);
  ret += " " + temp.padStart(2,"0");
  tmp = Math.floor(data.cal.date.seconds/3600);
  temp = "" + tmp;
  ret += " " + temp.padStart(2,"0");
  temp = "" + Math.floor((data.cal.date.seconds-(tmp*3600))/60);
  ret += ":" + temp.padStart(2,"0");
  temp = "" + Math.floor((data.cal.date.seconds-(tmp*3600))%60);
  ret += ":" + temp.padStart(2,"0");

  return ret;
}
