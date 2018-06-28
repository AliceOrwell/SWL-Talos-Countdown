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
  this.when = when;
  this.forecasts = [when];

  // Calculate remaining time
  var diff = when - now;
  this.remaining = moment.duration(diff, "milliseconds");

  // Generate forecast spawn windows
  var num_forecasts = 4;
  for(var i=0; this.forecasts.length < num_forecasts; i++) {
    var time = this.forecasts[i];
    time = moment(time);            // unlink the association with new instance

    var forecast = advanceWindow(time);
    this.forecasts.push(forecast);
  }
  // Stringify the forecasts
  for(var i=0; i < this.forecasts.length; i++) {
    var fmt = settings.forecast_date_format;
    this.forecasts[i] = this.forecasts[i].format(fmt);
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
*/
Talos.prototype.isGracePeriod = function() {
  var hours = this.remaining.hours();
  var minutes = this.remaining.minutes();

  var result = (hours == 10 && minutes >= 58);
  return result;
};

/*
  Returns true if spawn window i.e. the portal is open
*/
Talos.prototype.isNow = function() {
  var hours = this.remaining.hours();
  var minutes = this.remaining.minutes();

  var result = (hours == 10 && minutes >= 50 && minutes < 58);
  return result;
};

/*
  Returns true if is next to spawn.
*/
Talos.prototype.isNext = function() {
  var hours = this.remaining.hours();
  var minutes = this.remaining.minutes();

  var result = (hours == 0);
  return result;
};

Talos.prototype.status = function() {
  if (this.isGracePeriod()) {
    return "Head to Gate. Opening in less than 2 minutes.";
  }
  if (this.isNow()) {
    return "Gate now open.";
  }

  var fmt = "hh[H] mm[M] ss[S]";
  var m = this.remaining.format(fmt, {trim: false});
  return m;
};
