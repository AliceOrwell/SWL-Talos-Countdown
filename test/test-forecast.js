QUnit.module("forecast.js");
QUnit.test("isNext", function(assert) {
  now = moment();

  var time = moment(now).add(2, "hours");
  var fc = new Forecast(time);

  assert.deepEqual(fc.isNext(), false, "Not next: 2 hours remaining");

  now.add(59, "minutes");
  assert.deepEqual(fc.isNext(), false, "Not next: 1 hour 1 min remaining");

  now.add(1, "minutes");
  assert.deepEqual(fc.isNext(), true, "Next: 1 hour remaining");

  now.add(1, "minutes");
  assert.deepEqual(fc.isNext(), true, "Next: 59 min remaining");

  now.add(60, "minutes");
  assert.deepEqual(fc.isNext(), true, "Next: -1 min remaining");
});

QUnit.test("isExpired", function(assert) {
  now = moment();

  var time = moment(now).add(5, "minutes");
  var fc = new Forecast(time);

  assert.deepEqual(fc.isExpired(), false, "Not expired");

  now.add(5, "minutes");
  assert.deepEqual(fc.isExpired(), false, "Not expired");

  now.add(5, "minutes");
  assert.deepEqual(fc.isExpired(), false, "Not expired");

  now.add(5, "minutes");
  assert.deepEqual(fc.isExpired(), true, "Expired");
});
