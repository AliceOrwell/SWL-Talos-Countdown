/**********************************************************
  SWL Talos Countdown
	https://github.com/AliceOrwell/SWL-Talos-Countdown/

	Copyright (c) 2018 AliceOrwell
	Released under the MIT license

  ------------
  Requires the libraries:-
    momentjs
    monentjs-duration-format

 **********************************************************/



function Talos(name, index, when) {
  this.name = name;
  this.index = index;
  this.id = this.name + "-" + String(index);
  this.when = moment(when);

  this.window_start = moment(this.when);
  this.window_start = retreatWindow(this.window_start);

  this.grace_end = moment(this.window_start);
  this.grace_end.add(settings.grace_period, "ms");

  this.window_end = moment(this.grace_end);
  this.window_end.add(settings.window_period, "ms");

  // Generate forecast spawn windows
  this.forecasts = [when];
  var num_forecasts = 4;
  for(var i=0; this.forecasts.length < num_forecasts; i++) {
    var time = this.forecasts[i];
    var forecast = advanceWindow(time);
    this.forecasts.push(forecast);
  }
  // Stringify the forecasts
  for(var i=0; i < this.forecasts.length; i++) {
    var fmt = settings.format_forecast;
    this.forecasts[i] = this.forecasts[i].format(fmt, {trim: false});
  }
}

/*
  Creates then returns the HTML block for representing a golem
*/
Talos.prototype.getHTML = function() {
  var elem = document.createElement("div");
  var $elem = $(elem);

  // Label the wrapper
  $elem.addClass('golem');
  $elem.attr("id", this.id);

  // Put in the foundations
  $elem.append("<div class='name'>");
  $elem.append("<div class='remaining'>");
  $elem.append("<div class='time'>");

  // Adjust classes based on golem status
  if (this.isNow()) {
    $elem.addClass("now");
  }
  else if (this.isGracePeriod()) {
    $elem.addClass("grace");
  }
  else if (this.isNext()) {
    $elem.addClass("next");
  }

  // Fill in the foundations
  $elem.find(".name").html(this.name);                    // Name
  $elem.find(".remaining").html(this.status());         // Remaining time
  $elem.find(".time").html(this.forecasts.join(", "));    // Forecasts

  return elem;
};

/*
  Returns true if loading screen grace period i.e.
  the 2 minutes after hour.

  In order to be in the grace period we need to look at the previous forecast
*/
Talos.prototype.isGracePeriod = function() {
  var result = (now >= this.window_start && now < this.grace_end);
  return result;
};

/*
  Returns true if spawn window i.e. the portal is open
*/
Talos.prototype.isNow = function() {
  var result = (now >= this.grace_end && now < this.window_end);
  return result;
};

/*
  Returns true if is next to spawn.
*/
Talos.prototype.isNext = function() {
  var remaining = this.getRemaining();

  var interval = moment.duration(settings.interval, "ms");
  interval.add(settings.grace_period);

  var result = (remaining < interval);
  return result;
};

Talos.prototype.isExpired = function() {
  var result = (now >= this.window_end);
  return result;
};

Talos.prototype.getRemaining = function() {
  var grace_end = moment(this.when);
  grace_end.add(settings.grace_period, "ms");

  var diff = grace_end.diff(now);  // Time from now til end of grace period
  var remaining = moment.duration(diff, "ms");

  return remaining;
};


Talos.prototype.status = function() {
  var diff;

  var dur = this.getRemaining();
  var fmt = settings.format_remaining;

  if (this.isGracePeriod()) {
    diff = this.grace_end.diff(now);

    dur = moment.duration(diff, "ms");
    fmt = settings.format_grace;
  }
  else if (this.isNow()) {
    diff = this.window_end.diff(now);

    dur = moment.duration(diff, "ms");
    fmt = settings.format_now;
  }

  return dur.format(fmt, {trim: false});
};
