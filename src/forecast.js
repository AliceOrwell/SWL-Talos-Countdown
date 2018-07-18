function Forecast(time) {
  this._start = moment(time);
  this._grace_end = undefined;
  this._end = undefined;
}

Forecast.prototype.toString = function() {
  var fmt = settings.format_forecast;
  return this._start.format(fmt, {trim: false});
};

Forecast.prototype.nextWindow = function() {
  var offset = settings.getSequenceInterval();
  this._start.add(offset, "ms");
  this._grace_end = undefined;
  this._end = undefined;
};

Forecast.prototype.previousWindow = function() {
  var offset = settings.getSequenceInterval();
  this._start.subtract(offset, "ms");
  this._grace_end = undefined;
  this._end = undefined;
};

Forecast.prototype.shiftWindow = function(end_time) {
  while(this._start < end_time && !isEventExpired(this._start)) {
    this.nextWindow();
  }
  return this.getStart();
};

Forecast.prototype.getEnd = function() {
  if (this._end) {
    return this._end;
  }
  this._end = moment(this.getGraceEnd());
  this._end.add(settings.fight_period, "ms");
  return this._end;
};

Forecast.prototype.getGraceEnd = function() {
  if (this._grace_end) {
    return this._grace_end;
  }
  this._grace_end = moment(this._start);
  this._grace_end.add(settings.grace_period, "ms");
  return this._grace_end;
};

Forecast.prototype.getRemaining = function() {
  var grace = this.getGraceEnd();
  var diff = grace.diff(now);  // Time from now til end of grace period

  var remaining = moment.duration(diff, "ms");
  return remaining;
};

Forecast.prototype.getStart = function() {
  return this._start;
};

Forecast.prototype.isGracePeriod = function() {
  var start = this.getStart();
  var end = this.getGraceEnd();
  var result = (now >= start && now < end);
  return result;
};

Forecast.prototype.isNow = function() {
  var start = this.getGraceEnd();
  var end = this.getEnd();
  var result = (now >= start && now < end);
  return result;
};

Forecast.prototype.isNext = function() {
  var remaining = this.getRemaining();

  var interval = moment.duration(settings.interval, "ms");
  interval.add(settings.grace_period, "ms");

  var result = (remaining <= interval);
  return result;
};

Forecast.prototype.isExpired = function() {
  var end = this.getEnd();
  var result = (now >= end);
  return result;
};

Forecast.prototype.update = function() {
  if (this.isExpired()) {
    this.shiftWindow(now);
  }
};
