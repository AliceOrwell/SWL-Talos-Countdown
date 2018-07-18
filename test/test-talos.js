QUnit.module("talos.js isGracePeriod()");
QUnit.test("Is Grace Period", function(assert) {
  var expected = true;

  now = moment("2018-06-28T01:01:00+00:00");
  var when = moment("2018-06-28T01:00:00+00:00");
  var golem = new Talos("Frank", 0, when);
  assert.deepEqual(golem.window.isGracePeriod(), expected);

  now = moment("2018-06-28T01:01:59+00:00");
  when = moment("2018-06-28T01:00:00+00:00");
  golem = new Talos("Frank", 0, when);
  assert.deepEqual(golem.window.isGracePeriod(), expected);
});

QUnit.test("Is not Grace Period", function(assert) {
  var expected = false;

  now = moment("2018-06-28T01:05:00+00:00");

  var when = moment("2018-06-28T01:00:00+00:00");
  var golem = new Talos("Frank", 0, when);

  assert.deepEqual(golem.window.isGracePeriod(), expected);

  now = moment("2018-06-28T00:59:00+00:00");
  when = moment("2018-06-28T01:00:00+00:00");
  golem = new Talos("Frank", 0, when);
  assert.deepEqual(golem.window.isGracePeriod(), expected);
});
