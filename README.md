# Extract Postal Addresses from Web Pages, in the browser

*ziprip* looks for postal addresses on webpages, either in the browser or in node.js. It also works very hard to try and geocode the addresses it finds, usually by searching the page for things like *Google Maps* elements and so on.

It's intended especially to be used for bookmarklets and browser plugins, and used to power a website called [PlaceSteal](http://www.placesteal.com/) that never really took off.

Currently it handles UK and US addresses. Adding other English-speaking countries should be trivial, other languages a bit more challenging but certainly doable.

# Getting It

## Client-side

You can download the latest **browser version** on the [downloads](https://github.com/sheriff/ziprip/downloads) page, or from the `dist` directory.

For **node.js**, simply:

    npm install ziprip

And finally if you just want to play around with it in your **browser's javascript console**, you can do:

    var script=document.createElement('script');script.type='text/javascript';script.src='http://cloud.github.com/downloads/sheriff/ziprip/ziprip-latest.js';document.head.appendChild(script);

and then, having given it a second to load:

    window.ziprip.extract( document, window.URL );

# Usage

*ziprip* has one method you should be interested in: `extract`, which accepts a *DOM object* and a *URL*. For *node.js* you can use [jsdom](https://github.com/tmpvar/jsdom/) for your DOM object, and in the browser obviously you just pass in `document`.

**node.js**

    var $ziprip = require('ziprip');
    var addresses = $ziprip.extract( domObject, url );

**Browser**

    <script type="text/javascript" src="ziprip.js"></script>
    <script>
        var addresses = window.ziprip.extract( document, window.URL );
    </script>

This will return several *address objects*:

Consider the address: *Prime Minister's Residence, 10 Downing Street, SW1A 2AA, UK*...

## Attributes

* `title` - A title for the address: "Prime Minister's Residence" in the example above. This may be the same as the first item in `atoms` if we didn't find a more suitable title.
atoms - An array of strings, representing the street address. Could be empty. ["10 Downing Street"] in the example above.
* `postcode` - The postcode or zipcode for the address. Will always be set. "SW1A 2AA" in the example above.
* `country` - The country the address is in. Will always be set. Current possible values are 'US' and 'UK' - "UK" in the example above.
* `lat`/`lon` - Coordinates for the address. Some extractors will also be able to determine these, so they're included. Should be either undefined or integer. Undefined in the example above.

## Methods

* `isGeocoded` - *Boolean* - are `lat` and `lon` set?
* `flatten` - Returns `atoms`, `postcode`, and `country` as one flat list: ["10 Downing Street", "SW1A 2AA", "UK"]
* `formatForGeocode` - Returns a string suitable for passing to a geocoder. Country is included only if it's not 'US', and other fields are comma-delimited, with title ommitted. "10 Downing Street, SW1A 2AA, UK"

****

[![Build Status](https://secure.travis-ci.org/sheriff/ziprip.png)](http://travis-ci.org/sheriff/ziprip)

*ziprip* is released under the [MIT license](https://github.com/sheriff/ziprip/blob/master/LICENSE.txt/), because all of its external dependencies use it. That, kids, is the magic of open source, or something.

