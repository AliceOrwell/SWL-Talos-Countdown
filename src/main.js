/**********************************************************
  SWL Talos Countdown
	https://github.com/AliceOrwell/SWL-Talos-Countdown/

	Copyright (c) 2018 AliceOrwell
	Released under the MIT license
 **********************************************************/


var now = moment();

var settings = {
  // When the event ends
  event_end: "2018-07-17T13:00:00+00:00",          // Assumed end date

  // Known occurance of a golem. Used to calculate all other golem times.
  known_golem_time: "2018-06-22T06:00:00+00:00",
  // Index in golems array for known golem
  known_golem_index: 0,                            // Magma golem

  // List of the golem names in their spawn sequence.
  golems: ["Magma", "Silver", "Frost", "Clay", "Technology",
           "Concrete", "Stone", "Water", "Sand", "Swarm", "Verdant"],

  // Frequency of golems in ms.
  interval: 1000 * 60 * 60,     // 1 hour
  // Duration of grace period in ms.
  grace_period: 1000 * 60 * 2,  // 2 minutes
  // Duration golem portal is open in ms.
  window_period: 1000 * 60 * 8, // 8 minutes

  now_date_format: "ddd DD MMM YYYY HH:mm:ss ZZ", // e.g. Wed 27 Jun 2018 23:01:22+0100
  forecast_date_format: "ddd DD MMM HH:mm",       // e.g. Wed 27 Jun 23:00

  // Duration of golem sequence in ms
  getSequenceInterval: function() {
    return this.interval * this.golems.length;  // Freq of golems * num of golems
  }
};



 /*
   Naughtily modify built-in type to extend funcionality.
   Return an array with contents of original shifted so item at given index is
   at index 0. Doesn't modify original array.
 */
 Array.prototype.indexShift = function(index) {
   if (index >= this.length || index < 0) {
     // Invalid index
     throw new Error('Invalid index');
   }

   var left = this.slice(0, index);   // Take the left part up to the index
   var right = this.slice(index);     // And the right part
   var shifted = right.concat(left);  // Place left after right in order to shift

   return shifted;
 };

/*
  Returns true if for the givn time the event would be expired
*/
function isEventExpired(time) {
  var end = settings.event_end;
  end = moment(end);

  var diff = time.diff(end);
  return diff > 0;
}

/*
  Returns a moment that is offset by the golem sequence interval.
  Doesn't alter the given moment
*/
function advanceWindow(time) {
  time = moment(time);    // new instance

  var offset = settings.getSequenceInterval();
  time.add(offset, "ms");
  return time;
}

/*
  Returns a moment that has been offset to produce the next spawn window.
  Doesn't alter the given moment
*/
function getNextSpawn(time) {
  time = moment(time);  // new instance
  while(now.diff(time) > 0 && !isEventExpired(time)) {
    time = advanceWindow(time);
  }
  return time;
}


/*
  Refresh function - creats and updates the golem data
*/
function tick() {
  now = moment();             // Update time

  var fmt = settings.now_date_format;
  var display_now = now.format(fmt);
  $("#current_time").html(display_now);   // Display time to user.

  $("#golems").html("");      // Clear old data

  // Initialise golems
  var golem_names = settings.golems;
  // TODO: shift golem names due to settings
  var golems = [];
  for(var i=0; i < golem_names.length; i++) {
    var golem_time = moment(settings.known_golem_time);
    var seq_offset = settings.interval * i;
    golem_time.add(seq_offset, "ms");

    golem_time = getNextSpawn(golem_time);
    var golem = new Talos(golem_names[i], i, golem_time);
    golems.push(golem);
  }

  // Sort
  golems.sort(function(a, b) {
    if (a.isNow() || a.isGracePeriod()) {
      return -1;
    }
    if (b.isNow() || b.isGracePeriod()) {
      return 1;
    }
    if (a.remaining < b.remaining) {
      return -1;
    }
    if (a.remaining > b.remaining) {
      return 1;
    }
    return 0;
  });

  // Display
  for(var i=0; i < golem_names.length; i++) {
    $("#golems").append(golems[i].getHTML());
  }
}
