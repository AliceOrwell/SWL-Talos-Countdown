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



function Talos(name, index, window_start) {
  this.name = name;
  this.index = index;
  this.window = new Forecast(window_start);

  this.num_forecasts = 4;

  this.id = undefined;
  this.forecasts = undefined;
}

Talos.prototype.updateClasses = function($elem) {
  if (this.window.isNow()) {
    $elem.addClass("now");
    $elem.removeClass("next");
    $elem.removeClass("grace");
  }
  else if (this.window.isGracePeriod()) {
    $elem.addClass("grace");
    $elem.removeClass("next");
    $elem.removeClass("now");
  }
  else if (this.window.isNext()) {
    $elem.addClass("next");
    $elem.removeClass("grace");
    $elem.removeClass("now");
  }
  else {
    $elem.removeClass("next");
    $elem.removeClass("grace");
    $elem.removeClass("now");
  }
};

/*
  Creates then returns the HTML block for representing a golem
*/
Talos.prototype.createHTML = function() {
  var elem = document.createElement("div");
  var $elem = $(elem);

  // Label the wrapper
  $elem.addClass('golem');

  // Put in the foundations
  $elem.append("<div class='name'>");
  $elem.append("<div class='remaining'>");
  $elem.append("<div class='forecasts'>");

  // Adjust classes based on golem status
  this.updateClasses($elem);

  // Fill in the foundations
  this.setHTMLDetails($elem);

  return elem;
};

Talos.prototype.setHTMLDetails = function($elem) {
  $elem.attr("id", this.getId());

  $elem.find(".name").html(this.name);            // Name
  $elem.find(".remaining").html(this.status());   // Remaining time

  var forecasts = this.getForecasts();            // Forecasts
  forecasts = forecasts.join(", ");
  $elem.find(".forecasts").html(forecasts);

  // Adjust classes based on golem status
  this.updateClasses($elem);
};

Talos.prototype.getForecasts = function() {
  if (this.forecasts) {
    return this.forecasts;
  }

  // Generate forecast spawn windows
  var start = this.window.getStart();
  var forecast = new Forecast(start);
  this.forecasts = [forecast];
  for(var i=0; this.forecasts.length < this.num_forecasts; i++) {
    start = this.forecasts[i].getStart();
    forecast = new Forecast(start);

    forecast.nextWindow();
    this.forecasts.push(forecast);
  }

  return this.forecasts;
};

Talos.prototype.getId = function() {
  if (this.id) {
    return this.id;
  }
  this.id = String(this.name) + "-" + String(this.index);
  return this.id;
};

Talos.prototype.status = function() {
  var diff;

  var dur = this.window.getRemaining();
  var fmt = settings.format_remaining;

  if (this.window.isGracePeriod()) {
    diff = this.window.getGraceEnd().diff(now);

    dur = moment.duration(diff, "ms");
    fmt = settings.format_grace;
  }
  else if (this.window.isNow()) {
    diff = this.window.getEnd().diff(now);

    dur = moment.duration(diff, "ms");
    fmt = settings.format_spawn;
  }

  return dur.format(fmt, {trim: false});
};

Talos.prototype.update = function() {
  if (this.window.isExpired()) {
    this.forecasts = undefined;
  }
  this.window.update();
};
