

exports.extractor = function ( dom, url, toolkit, stash ) {

    var addresses = [];
    var seen = {};
    var cardElements = toolkit.sz('*[class~="hcard"],*[class~="vcard"]');

    for (var i=0; i < cardElements.length; i++) {
        var card = cardElements[i];

        // Attempt to get the title first of all
        var orgName;
        var org = toolkit.sz('*[class~="org"]', card)[0];
        if (org) orgName = toolkit.nodeToText(org);

        // Now string together other bits of the address
        var addr = toolkit.sz('*[class~="adr"]', card)[0];
        if (! addr) continue;

        var asText = '';

        var parts = [
            'street-address', 'extended-adddress', 'locality', 'region',
            'postal-code','country-name'
        ];

        for (var ii=0; ii < parts.length; ii++) {
            var part = parts[ii];
            var atom = toolkit.sz('*[class~="' + part + '"]', addr)[0];

            if ( atom ) {
                var val = toolkit.nodeToText(atom);

                // Fix up postcodes if they're weird...
                if (part == 'postal-code') {
                    val = val.replace(/^\s*(\d\d\d\d\d)(\d\d\d\d)\s*$/, "$1-$2")
                }

                // Append these parts. We append with a newline, except for
                // region, as we don't want to split that from a postcode
                if (part == 'region') {
                    asText += val + ' ';
                } else {
                    asText += val + "\n";
                }
            }
        }

        if (! seen[asText]) {
            seen[asText] = 1;
            var parsedAddress = toolkit.addressFromString( toolkit, asText )[0];

            if ( parsedAddress ) {
                parsedAddress['atoms'] = toolkit.cleanAddress( parsedAddress['atoms'] );
                parsedAddress['via'] = 'hvCard';
                if (orgName) {
                    parsedAddress['title'] = orgName;
                    if ( parsedAddress['atoms'][0] == orgName ) {
                        parsedAddress['atoms'].shift();
                    }
                }
                addresses.push( parsedAddress );
            }
        }
    }

    return addresses;
}
