
var jsdom = require("jsdom");
var fs    = require('fs');
var test  = require("tap").test;

// List of corpus files to test
var files = process.argv; files.shift(); files.shift();

var defaultZiprip = '../';
if (files[0] && files[0].match(/\.js$/)) {
    var defaultZiprip = files.shift();
}

if (files.length == 0 ) {
    files = fs.readdirSync(__dirname + '/corpus/');
    for (var i = 0; i < files.length; i++) {
        files[i] = __dirname + '/corpus/' + files[i];
    }
}


// Load up ziprip
var ziprip = require( defaultZiprip );
var json = ziprip._zipripToolkit['json'];

var passes = 0;
var fails = 0;

var via = {};

function nextFile () {
    var file = files.shift();
    if ( file != undefined ) {
        processFile( file );
    }
}

nextFile();

function processFile ( filename ) {

    // Read in the file contents, and split it in to testSetup, containing the
    // JSON payload, and html, containing the HTML we'll be extracting from
    var content = fs.readFileSync( filename );
    var atoms = content.toString('ascii').split(/\n---DIVIDER---\n/);
    var testSetup = json.parse( atoms[0] );
    var html = atoms[1];

    // Setup a test
    test("Checking " + filename, function (tap) {

        // Load the HTML in to the fake browser
        jsdom.env( html, function (err, window) {

            // Bail out if there was a problem
            if (err) {
                tap.ok( 0, "Failed to parse: " + err );
                tap.end();
                return;
            }

            // Take in the addresses. We only test for the first two.
            var results = ziprip.extract( window.document, testSetup.url );
            for (var i = 0; i < 2; i++) {

                // Get the address we'll test against
                var expected = testSetup['addresses'][i];
                if (! expected ) {continue;}
                expected = ziprip._zipripToolkit.addressFromFields( expected )._fieldsOnly();

                // Clean up the address we received
                var result = results[i] ? results[i]._fieldsOnly() : 'no result';

                // Test
                tap.isDeeply( result, expected, "Address " + (i + 1) + " matches");
            }

            tap.end();
        });
    });

    nextFile();
}
