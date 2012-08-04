
// Usual way in to the library

//
// METHODS
// 	extract() accepts a DOM object, and a string URL, and returns address
//  address objects.
//

// Load the toolkit
exports._zipripToolkit = require('toolkit');

// Extractors to load
var extractorModules = ['Google','HVCard','FromText'];
var extractors = [];
for (var i = 0; i < extractorModules.length; i++) {
    var extractor = require('extractor' + extractorModules[i])['extractor'];
    extractors.push( extractor );
}

// Load the lower-level extraction interface
var extractUsing = require('extractUsing')['extractUsing'];

exports.extract = function ( dom, url ) {
    return extractUsing( dom, url, exports._zipripToolkit, {}, extractors);
}

exports.version = "0.0.1";

