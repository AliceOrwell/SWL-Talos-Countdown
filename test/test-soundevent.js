QUnit.module("soundevent.js");
QUnit.test("isEventNow", function(assert) {
  now = moment();

  var name = "Test";
  var type = "Test";
  var options = {};
  var time = moment();
  time.add(5, "minutes");

  var se = new SoundEvent(name, time, type, options);

  var result = se.isEventNow();
  assert.deepEqual(result, false, "Not time");

  result = se.isEventNow();
  assert.deepEqual(result, false, "Not time");

  now.add(10, "minutes");

  result = se.isEventNow();
  assert.deepEqual(result, true, "Time");
  result = se.isEventNow();
  assert.deepEqual(result, false, "Not time");

});
