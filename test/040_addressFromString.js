
var test = require("tap").test

var addressClass = require('../src/address');
var address = addressClass['address'];
var addressFromFields = addressClass['addressFromFields'];
var addressFromString = require('../src/addressFromString')['addressFromString'];

var toolkit = {'addressFromFields': addressFromFields};

var returned = addressFromString(toolkit, "10 Downing Street, London, SW1A 2AA")[0];
var expected = addressFromFields({
    'via': '',
    'title': '10 Downing Street',
    'atoms': ['10 Downing Street', 'London'],
    'country': 'UK',
    'postcode': 'SW1A 2AA',
});

test("Simple addressFromString", function(tap) {
    tap.isDeeply(
        returned._fieldsOnly(),
        expected._fieldsOnly(),
        "Simple address match works"
    );
    tap.end();
});