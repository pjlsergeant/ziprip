
var test = require("tap").test
var addressClass = require('../src/address');
var address = addressClass['address'];
var addressFromFields = addressClass['addressFromFields'];

test("isGeocoded", function (tap) {
    var notCoded = addressFromFields({});
    tap.notOk( notCoded.isGeocoded(), "isGeocoded false when fields not set");

    var zeroCoded = addressFromFields({ 'lat': 0, 'lon': 0 });
    tap.ok( zeroCoded.isGeocoded(), "isGeocoded true at origin");

    var isCoded = addressFromFields({ 'lat': 10, 'lon': -10 });
    tap.ok( isCoded.isGeocoded(), "isGeocoded true standard coords");

    tap.end();
});

test("flatten", function (tap) {
    var addr = addressFromFields({
        'title': 'Should be lopped off',
        'atoms': ['1','2'],
        'postcode': '3',
        'country': '4'
    });

    var reference = ['1','2','3','4'];
    var returned  = addr.flatten();

    tap.isDeeply( returned, reference, "flatten seems to be working");
    tap.end();
});

test("formatForGeocode", function (tap) {
    var addr = addressFromFields({
        'title': 'Ignore',
        'atoms': ['1','2'],
        'postcode': '3',
        'country': 'UK'
    });
    var withCountry = addr.formatForGeocode();
    tap.is( withCountry, '1, 2, 3, UK', "UK left in geocoded address" );

    addr['country'] = 'US';
    var withoutCountry = addr.formatForGeocode();
    tap.is( withoutCountry, '1, 2, 3', "US removed from geocoded address");

    tap.end();
});