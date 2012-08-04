
//
// Address Objects
//
// Consider: "Prime Minister's Residence, 10 Downing Street, SW1A 2AA, UK"
//
// Attributes:
//   title    - A title for the address: "Prime Minister's Residence" in the
//              example above. This may be the same as the first item in 'atoms'
//   atoms    - An array of strings, representing the street address. Could be
//              empty. ["10 Downing Street"] in the example above.
//   postcode - The postcode or zipcode for the address. Will always be set.
//              "SW1A 2AA" in the example above.
//   country  - The country the address is in. Will always be set. Current
//              possible values are 'US' and 'UK' - "UK" in the example above.
//   lat/lon  - Coordinates for the address. Some extractors will also be able
//              to determine these, so they're included. Should be either
//              undefined or signed integer. Undefined in the example above.
//
// Methods:
//   isGeocoded       - Boolean - are lat and lon set?
//   flatten          - Returns atoms, postcode, and country as one flat list.
//                      ["10 Downing Street", "SW1A 2AA", "UK"]
//   formatForGeocode - Returns a string suitable for passing to a geocoder.
//                      Country is included only if it's not 'US', and other
//                      fields are comma-delimited, with title ommitted.
//                      "10 Downing Street, SW1A 2AA, UK"
//

// Define an address object to wrap outgoing addresses in
exports.address = function () {

    // Members
    this['title']    = '';
    this['atoms']    = [];
    this['postcode'] = '';
    this['country']  = '';
    this['lat']      = undefined;
    this['lon']      = undefined;
    this['via']      = '';

    // Return true or false depending on if we also found coordinates from the
    // address
    this.isGeocoded = function () {
        if (
            (typeof this['lat']) != 'undefined' &&
            (typeof this['lon']) != 'undefined'
        ) {
            return true;
        } else {
            return false;
        }
    }

    // Returns all the constitutent parts of the address as a list of strings.
    // This explicitly does NOT include the title. If you don't want the
    // country, lop off the last part.
    this.flatten = function () {
        var parts = [];

        // Add the atoms
        parts = parts.concat( this['atoms'] );

        // And the final bits
        if (this['postcode']) parts.push( this['postcode'] );
        parts.push( this['country']  );

        return parts;
    }

    // Return in a format suitable for most geocoders. US-Centric Capitalist
    // Geocoders, that is...
    this.formatForGeocode = function () {
        var parts = this.flatten();
        var country = parts[parts.length-1];

        // Every Geocoder I've seen just assumes the US, and some get quite
        // confused if you mention it... Plus, is it US? Or United States? You'd
        // think Geocoders could handle that, yet...
        if ( country == 'US' ) {
            parts.pop();
        }

        return parts.join(', ');
    }

    // One day I need to work out why isDeeply doesn't like shared functions,
    // but until then, this is a little easier...
    this._fieldsOnly = function () {
        var testObject = {};
        var attr = ['title','atoms','postcode','country','via','lat','lon'];
        for (var i = 0; i < attr.length; i++ ) {
            if ((typeof this[attr[i]]) == 'function') continue;
            testObject[attr[i]] = this[attr[i]];
        }
        return testObject;
    }
}

exports.addressFromFields = function (fields) {
    var addressObject = new exports.address;
    for (var key in fields) {
        addressObject[key] = fields[key];
    }
    return addressObject;
}
