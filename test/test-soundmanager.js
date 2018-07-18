QUnit.module("soundmanager.js");
QUnit.test("init", function(assert) {
  now = moment();

  var name = "T1";
  var i = 0;
  var time = moment();
  time.add(5, "minutes");
  var golem = new Talos(name, i, time);

  var sm = new SoundManager();
  assert.deepEqual(sm.golem, undefined, "No golem registered");
  assert.deepEqual(sm.sound_events, [], "No sound events");
});

QUnit.test("register with no previous", function(assert) {
  now = moment();

  var name = "T1";
  var i = 0;
  var time = moment();
  time.add(5, "minutes");
  var golem = new Talos(name, i, time);

  var sm = new SoundManager();

  sm.register(golem);
  assert.deepEqual(sm.golem, golem, "Golem registered");
  assert.deepEqual(sm.sound_events.length, 2, "Sound events registered");
});

QUnit.test("register with previous", function(assert) {
  now = moment();

  var name = "T1";
  var i = 0;
  var time = moment();
  time.add(5, "minutes");
  var golem = new Talos(name, i, time);

  var sm = new SoundManager();

  sm.register(golem);
  assert.deepEqual(sm.golem, golem, "Golem registered");
  assert.deepEqual(sm.sound_events.length, 2, "Sound events registered");

  var se = sm.sound_events;

  name = "T2";
  i = 1;
  time = moment();
  time.add(10, "minutes");
  var golem2 = new Talos(name, i, time);

  sm.register(golem2);
  assert.notDeepEqual(sm.golem, golem, "No longer previous registered");
  assert.deepEqual(sm.golem, golem2, "Newly registered");
  assert.notDeepEqual(sm.sound_events, se, "New sound events registered");
});
