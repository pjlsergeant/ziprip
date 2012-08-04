
var test = require("tap").test
var jsdom = require("jsdom");

var domToText  = require('../src/domToText')['domToText'];
var nodeToText = require('../src/nodeToText')['nodeToText'];

// Facile example
jsdom.env(
	'<html><body>Quick<div>brown<p>fox<span>jumps</span>over</p>lazy</div>dog</body></html>',
	[],
	function (errors, window) {
        test("Very simple domToText test", function (tap) {
		  var result = domToText(window.document,{'nodeToText': nodeToText});
		  tap.equal( result, "Quick\nbrown\nfoxjumps, over\nlazy\n\ndog", "Text matches");
          tap.end();
        });
	}
);
