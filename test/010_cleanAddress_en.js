
// Simple tests for cleanAddress_en

var tests = [
    {
        'input':  ['Blah Blah', '10 Downing Street', 'London'],
        'output': ['10 Downing Street', 'London'],
        'name':   "Numbered simple case"
    },
    {
        'input':  ['Foo', 'Blah Blah', 'Downing Street', 'London'],
        'output': ['Blah Blah', 'Downing Street', 'London'],
        'name':   "Non-Numbered simple case"
    },
    {
        'input':  ['10 Downing Street', '10 Downing Street', 'London'],
        'output': ['10 Downing Street', 'London'],
        'name':   "Furthest-down only"
    },
];

var test = require("tap").test
var cleanAddress = require('../src/cleanAddress_en')['cleanAddress'];

test("Check some simple cleanAddress_en examples", function (tap) {
    for (var i = 0; i < tests.length; i++) {
        var t = tests[i];
        var result = cleanAddress(t['input']);
        tap.isDeeply( result, t['output'], t['name'] );
    }
    tap.end();
});
