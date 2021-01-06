/**********************************************************
  SWL Talos Countdown
	https://github.com/AliceOrwell/SWL-Talos-Countdown/

	Copyright (c) 2018 AliceOrwell
	Released under the MIT license
 **********************************************************/



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
  Merge two objects with b overwriting existing values in a and not introducing
  new keys.
*/
function extend(a, b) {
  // For matching keys overwrite the values of object a with the values of b
  for(var key in a) {
    if(b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
  return a;
}



/*
  Filthy disgusting globals.
*/
var settings = {
  update_freq: 1000,

  // When the event ends
  event_end: "2022-07-17T13:00:00+00:00",          // Assumed end date

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
  fight_period: 1000 * 60 * 8, // 8 minutes
  // Duration of golem sequence in ms
  getSequenceInterval: function() {
    return this.interval * this.golems.length;  // Freq of golems * num of golems
  },

  format_forecast: "ddd MMM DD HH:mm",            // e.g. Wed Jun 27 23:00
  format_remaining: "hh[H] mm[M] ss[S]",          // e.g. 03H 13M 12S
  format_grace: "[Head to Gate.] mm[M] ss[S]",    // Head to Gate. 01M 49S
  format_spawn: "[NOW. Closing in:] mm[M] ss[S]", // NOW. Closing in: 01M 49S
};

var now = moment();

var manager = new Manager();
var sound_manager = new SoundManager();



function tick() {
  if (sound_manager.isSoundCompatible()) {
    // Reveal the notifications panel since sound compatible
    $('#notifications').show();
  }

  if (sound_manager.isTTSCompatible()) {
    var $elem = $('#tts_voices');
    sound_manager.populateTTSVoices($elem);

    // Reveal the TTS panel since compatible
    $('#tts').show();
  }

  // Update time
  now = moment();
  //now.add(37, "minutes");   // DEBUG code

  // Display current time to user.
  var current = new Date(now);      // Use a Date object as it has timezone string e.g. "GMT"
  $("#current_time").html(current);

  // Update golem and sound managers
  manager.tick();
  sound_manager.tick();
}

function main() {
  manager.init();
  tick();

  // Refresher
  var updater_id = window.setInterval(tick, settings.update_freq);
}



/*
  Returns true if for the givn time the event would be expired
*/
function isEventExpired(time) {
  var end = settings.event_end;
  end = moment(end);

  var diff = time.diff(end);
  return diff > 0;
}



function Manager() {
  this.$display = $("#golems");

  // Initialise golems
  var shift = settings.known_golem_index;   // Shift order to put reference golem at index 0
  var golem_names = settings.golems.indexShift(shift);

  this.golems = [];
  for(var i=0; i < golem_names.length; i++) {
    // Calculate spawn time in the sequence
    var golem_time = moment(settings.known_golem_time);
    var seq_offset = settings.interval * i;
    golem_time.add(seq_offset, "ms");

    // Find the next window the golem will spawn
    var f = new Forecast(golem_time);
    f.shiftWindow(now);
    golem_time = f.getStart();

    // Create
    var golem = new Talos(golem_names[i], i, golem_time);

    // Save it for later
    this.golems.push(golem);
  }
}

Manager.prototype.init = function() {
  // Sort golems based on current status.
  this.golems.sort(this.sortFn);

  // Display
  for(var i=0; i < this.golems.length; i++) {
    // Craft the HTML and display
    var golem = this.golems[i];
    this.$display.append(golem.createHTML());
  }
};

/*
  Refresh function - updates the golem data
*/
Manager.prototype.tick = function() {
  // Update golem data
  for(var i=0; i < this.golems.length; i++) {
    this.golems[i].update();
  }

  // Sort golems based on current status.
  this.golems.sort(this.sortFn);

  // Update HTML
  for(var i=0; i < this.golems.length; i++) {
    var $golem  = $("#golems > div").eq(i);
    this.golems[i].setHTMLDetails($golem);
  }

  // Attempt to register sound event for next golem
  var next_golem = this.golems[0];
  sound_manager.register(next_golem);
};

Manager.prototype.sortFn = function(a, b) {
  // Ascending order
  // non-time values are "low" in order to place at the top.
  if (a.window.isNow() || a.window.isGracePeriod()) {
    return -1;
  }
  if (b.window.isNow() || b.window.isGracePeriod()) {
    return 1;
  }
  if (a.window.getStart() < b.window.getStart()) {
    return -1;
  }
  if (a.window.getStart() > b.window.getStart()) {
    return 1;
  }
  return 0;
};
