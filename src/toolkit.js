// This is the default toolkit. This is the mechanism for changing bits of
// ziprip that you don't like - knock out or change the functionality of parts
// of this.

// Accepts a found address, and returns a copy that's simplified and/or cleaned
// for geocoding. The default is entirely English-language specific...
exports.cleanAddress = require('./cleanAddress_en')['cleanAddress'];

// Accepts a DOM node and tries to get its text content in a nice way
exports.nodeToText = require('./nodeToText')['nodeToText'];

// Accepts a DOM representing a whole page, and tries converting it to text
exports.domToText = require('./domToText')['domToText'];

// Given plain-text, tries to find addresses in it. Quite a few of the routines
// rely on this - it's probably the main clever part of the whole library - the
// generic extractor is a thin wrapper around it
exports.addressFromString = require('./addressFromString')['addressFromString'];

// JSON wrangler. Expected to support as least 'parse' and 'stringify'
exports.json = require('./json2')['json'];

// Sizzle and its loader
var sizzle = require('./sizzle');
exports.sz = sizzle['sz'];
exports.loadSizzle = sizzle['loadSizzle'];

// jsuri
exports.uri = require('./jsuri')['uri'];

// Create a new address container for passing back to the caller
var address = require('./address');
exports.address = address['address'];
exports.addressFromFields = address['addressFromFields'];