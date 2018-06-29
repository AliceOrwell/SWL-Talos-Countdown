/**********************************************************
  SWL Talos Countdown
	https://github.com/AliceOrwell/SWL-Talos-Countdown/

	Copyright (c) 2018 AliceOrwell
	Released under the MIT license
 **********************************************************/


/*
  Filthy disgusting globals.
*/
var settings = {
  update_freq: 1000,

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
  // Duration of golem sequence in ms
  getSequenceInterval: function() {
    return this.interval * this.golems.length;  // Freq of golems * num of golems
  },

  format_forecast: "ddd MMM DD HH:mm",            // e.g. Wed Jun 27 23:00
  format_remaining: "hh[H] mm[M] ss[S]",          // e.g. 03H 13M 12S
  format_grace: "[Head to Gate.] mm[M] ss[S]",    // Head to Gate. 01M 49S
  format_now: "[NOW. Closing in:] mm[M] ss[S]",   // NOW. Closing in: 01M 49S

};
var now = new Date();
var sound_mng = new SoundManager();
function snd_tick() {
  sound_mng.tick();
}



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
   Orphaned time functions in need of a home
 */

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

function retreatWindow(time) {
  time = moment(time);    // new instance

  var offset = settings.getSequenceInterval();
  time.subtract(offset, "ms");
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
  Orphaned sound functions in need of a home
*/
function isNotifyGrace() {
  return $("#chk_grace").is(":checked");
}
function isNotifySpawn() {
  return $("#chk_spawn").is(":checked");
}
function isSoundCompatible() {
  /*
  Check to see if the browser supports HTML5 mp3 playback
  Taken from: http://diveintohtml5.info/everything.html
  */
  var a = document.createElement('audio');
  return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
}
function isSoundEnabled() {
  return isSoundCompatible() && (isNotifyGrace() || isNotifySpawn());
}
function getVolume() {
  var volume = $("#volume").val();
  volume = volume / 100.0;
  return volume;
}
function notificationGrace() {
  var sound_woodblock = new Audio('data/woodblock.mp3');
  sound_woodblock.volume = getVolume();
  sound_woodblock.play();
}
function notificationSpawn() {
  var sound_woodblock = new Audio('data/woodblock.mp3');
  sound_woodblock.volume = getVolume();
  sound_woodblock.play();
}

/*
  A crude sound manager to deal with sound events
*/
function SoundManager() {
  this.offset = settings.update_freq / 2;
  this.golem = undefined;
  this.played_grace = false;
  this.played_spawn = false;
}
SoundManager.prototype.register = function(golem) {
  // if nothing registered
  if (!this.golem) {
    this.golem = golem;
  }
  // if a newer one (we expect to only be given the next)
  else if (golem.when > this.golem.when) {
    this.golem = golem;
    this.played_grace = false;
    this.played_spawn = false;
  }
};
SoundManager.prototype.isNow = function(time) {
  // if event is currently a little bit before...
  var start = moment(time);
  start.subtract(this.offset, "ms");

  // or a little bit after...
  var end = moment(time);
  var buffered_offset = this.offset * 1.2; // add somee extra buffer
  end.add(buffered_offset, "ms");

  // now, then it true
  if (now >= start && now <= end) {
    return true;
  }
  return false;
};
SoundManager.prototype.tick = function() {
  if (!isSoundEnabled()) {
    return;
  }
  if (!this.golem) {
    console.log("SoundManager: Nothing registered yet.");
    return;
  }

  if (isNotifyGrace()) {
    var start = this.golem.window_start;
    if (this.isNow(start) && !this.played_grace) {
      notificationGrace();
      this.played_grace = true;
    }
  }
  if (isNotifySpawn()) {
    var start = this.golem.grace_end;
    if(this.isNow(start) && !this.played_spawn) {
      notificationSpawn();
      this.played_spawn = true;
    }
  }
};



/*
  Refresh function - creats and updates the golem data
*/
function tick() {
  now = new Date();               // Update time
  $("#current_time").html(now);   // Display time to user.
  now = moment(now);

  // Initialise golems
  var shift = settings.known_golem_index;
  var golem_names = settings.golems.indexShift(shift);

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
    // Ascending order so consider non-time values as low in order to place
    // at the top.
    if (a.isNow() || a.isGracePeriod()) {
      return -1;
    }
    if (b.isNow() || b.isGracePeriod()) {
      return 1;
    }
    if (a.when < b.when) {
      return -1;
    }
    if (a.when > b.when) {
      return 1;
    }
    return 0;
  });

  // Register sound event, but only give the next
  if (isSoundEnabled()) {
    var next_golem = golems[0];
    sound_mng.register(next_golem);
  }

  // Display
  $("#golems").html("");      // Clear old data
  for(var i=0; i < golems.length; i++) {
    $("#golems").append(golems[i].getHTML());
  }
}
