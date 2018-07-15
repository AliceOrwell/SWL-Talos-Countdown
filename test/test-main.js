QUnit.module("main.js Array.indexShift()");
QUnit.test("Invalid index", function(assert) {
  var list = [1, 2, 3, 4];

  assert.throws(
    function() {
      list.indexShift(-2);
    },
    /Invalid index/,
    "raised error message contains 'index'"
  );

  assert.throws(
    function() {
      list.indexShift(list.length);
    },
    /Invalid index/,
    "raised error message contains 'index'"
  );
});

QUnit.test("Shift index 0", function(assert) {
  var list = [1, 2, 3, 4];
  var expected = [1, 2, 3, 4];

  assert.deepEqual(list.indexShift(0), expected, "Unchanged");
  assert.deepEqual(list, expected, "Original array unaltered");
});

QUnit.test("Shift index 3", function(assert) {
  var list = [1, 2, 3, 4];
  var copy = list;
  var expected = [4, 1, 2, 3];

  var shifted = list.indexShift(3);
  assert.deepEqual(shifted, expected, "Shifted");
  assert.deepEqual(list, copy, "Original array unaltered");
});


QUnit.module("main.js extend()");
QUnit.test("Doesn't insert new keys", function(assert) {
	var a = {"a": 1};
	var b = {"b": 1};
	var expected = a;

	var ca = a;
	var cb = b;

	a = extend(a, b);

	assert.deepEqual(a, expected, "Unchanged");
	assert.deepEqual(a, ca, "Unchanged");
	assert.deepEqual(b, cb, "Unchanged");
});

QUnit.test("Overwrite key", function(assert) {
	var a = {"a": 1, "b": 2};
	var b = {"c": 4, "a": 3};
	var expected = {"a": 3, "b": 2};

	var ca = a;
	var cb = b;

	var c = extend(a, b);

	assert.deepEqual(c, expected, "Changed");
	assert.deepEqual(a, ca, "Unchanged");
	assert.deepEqual(b, cb, "Unchanged");
});
