
QUnit.module("main.js isEventExpired()");
QUnit.test("Event in progress", function(assert) {
	now = moment("2017-07-17T13:00");
  settings.event_end = "2018-07-17T13:00";

  var expected = false;
	assert.deepEqual(isEventExpired(now), expected);
});

QUnit.test("Event expired", function(assert) {
  now = moment("2019-07-17T13:00");
  settings.event_end = "2018-07-17T13:00";

  var expected = true;
	assert.deepEqual(isEventExpired(now), expected);
});


QUnit.module("main.js advanceWindow()");
QUnit.test("Advance time by sequence", function(assert) {
  now = moment("2018-06-17T00:00:00+00:00");
  copy = moment("2018-06-17T00:00:00+00:00");
  var expected = moment("2018-06-17T11:00:00+00:00").toString();

  assert.deepEqual(advanceWindow(now).toString(), expected, "Advanced time");

  assert.deepEqual(now.toString(), copy.toString(), "Original nchnaged");
});



QUnit.module("main.js getNextSpawn()");
QUnit.test("Get next spawn window", function(assert) {
  var time = moment("2018-06-28T01:00:00+00:00");
  now = moment("2018-06-29T09:00:00+00:00");

  var expected = moment("2018-06-29T10:00:00+00:00").toString();
  assert.deepEqual(getNextSpawn(time).toString(), expected, "Found window");
});

QUnit.test("Event expired", function(assert) {
  /*
    TODO: Decide how to handle when event is over.
  */
  now = moment("2019-06-28T01:00:00+00:00");
  var expected = moment("2019-06-29T10:00:00+00:00").toString();

  assert.deepEqual(getNextSpawn(now).toString(), expected);
});
