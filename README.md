ziprip is a Javascript library for extracting postal address from webpages for
geocoding. This could be useful for bookmarklets or browser plugins that want to
allow people to clip addresses from the browser, or for Node applications that
require the ability to extract addresses from HTML.

It currently supports UK and US addresses only. Extending it to other
English-language addresses should be trivial, to non-English-language addresses
a little trickier, but on the roadmap.

[![Build Status](https://secure.travis-ci.org/sheriff/ziprip.png)](http://travis-ci.org/sheriff/ziprip)

_Documentation_: http://zipripjs.com/

_Code is in 'dist/'_

Installation via npm:

     npm install ziprip

Or download the latest browser version from downloads, above.

ziprip can run both as a node module and in the browser.

ziprip came from the code that powers http://www.placesteal.com/

ziprip is released under the MIT license, because all of its external
dependencies use it. That, kids, is the magic of open source, or something.
