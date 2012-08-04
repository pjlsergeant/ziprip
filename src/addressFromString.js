
var postcodes = [
    { "country": "UK", "one_only": true,  "regex_string":'\\b([a-z]\\d\\s\\d[a-z][a-z]|[a-z]\\d[a-z]\\s\\d[a-z][a-z]|[a-z]\\d\\d\\s\\d[a-z][a-z]|[a-z]\\d\\d[a-z]\\s\\d[a-z][a-z]|[a-z][a-z]\\d\\s\\d[a-z][a-z]|[a-z][a-z]\\d[a-z]\\s\\d[a-z][a-z]|[a-z][a-z]\\d\\d\\s\\d[a-z][a-z])\\b' },
    { "country": "US", "one_only": false, "regex_string":'\\b((Chicago,?|Houston,?|Philadelphia,?|Phoenix,?|Alabama,?|Alaska,?|Arizona,?|Arkansas,?|California,?|Colorado,?|Connecticut,?|Delaware,?|Florida,?|Georgia,?|Hawaii,?|Idaho,?|Illinois,?|Indiana,?|Iowa,?|Kansas,?|Kentucky,?|Louisiana,?|Maine,?|Maryland,?|Massachusetts,?|Michigan,?|Minnesota,?|Mississippi,?|Missouri,?|Montana,?|North Carolina,?|North Dakota,?|Nebraska,?|Nevada,?|New Hampshire,?|New Jersey,?|New Mexico,?|New York,?|Ohio,?|Oklahoma,?|Oregon,?|Pennsylvania,?|Rhode Island,?|South Carolina,?|South Dakota,?|Tennessee,?|Texas,?|Utah,?|Vermont,?|Virginia,?|Washington,?|West Virginia,?|Wisconsin,?|Wyoming,?|American Samoa,?|D\\.C\\.,?|Guam,?|Puerto Rico,?|AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NC|ND|NE|NV|NH|NJ|NM|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|AS|DC|GU|MP|PR|VI)\\s+\\d{5}(-\\d{4})?)\\b' }
];

// Add the block RE to each postcode block, and make real RegExps
for (var i = 0; i < postcodes.length; i++) {
    postcodes[i]['regex'] = new RegExp( postcodes[i]['regex_string'], 'i' );
    // Multi-line capture before hand
    postcodes[i]['regex_block'] = new RegExp( '([\\s\\S]+)(' + postcodes[i]['regex_string'] + ')', 'i' );
}

exports.addressFromString = function ( toolkit, text ) {

    // Build up addresses here
    var addresses  = [];

    // Postcodes we've already seen
    var codes_seen = {};

    // Attempt to split incoming text in to paragraphs
    var blocks = text.split(/\n\s*\n/);

    // In our first attempt, we pull out strings that end with postcodes, and
    // all that came before it in the block. So start with the Cartesian Product
    // of blocks and postcode types...
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var address = [];

        for (var ii = 0; ii < postcodes.length; ii++) {
            var country = postcodes[ii];

            // Do we match some stuff and then a postcode? Add some padding to
            // our block so we'll always have a leading block if we wanted one
            var padded = '  ' + block;
            var match = padded.match( country['regex_block'] );
            if ( match ) {
                var prefix   = match[1];
                var postcode = match[2];

                // For some countries, postcodes are specific enough that we
                // don't want to match twice
                if ( country['one_only'] ) {
                    if ( codes_seen[postcode] ) {
                        break;
                    } else {
                        codes_seen[postcode] = 1;
                    }
                }

                // It had something before the postcode
                if ( prefix.match(/\w/) ) {
                    address = [ prefix, postcode, country['country'] ];
                // Just the postcode (and maybe some space)
                } else {
                    address = [ postcode, country['country'] ];
                }
                break;
            }

            // Stop checking if we found an address
            if ( address.length > 0 ) { break; }
        }

        // Did we find something?
        if ( address.length > 0 ) {
            addresses.push( address );
        }
    }

    // Partial addresses with just a postcode, try a little harder to find an
    // address for it...
    var deletedOnTheFly = false;
    for (var i = 0; i < addresses.length; i++) {
        var address = addresses[i];

        // Check it's a postcode-only address
        if ( address.length != 2 ) continue;

        var postcode = address[0];

        // Traverse through the blocks again, this time paying close attention
        // to our index
        var foundAtoms = [];

        for ( var it = 0; it < blocks.length; it++ ) {
            // If a line has our postcode on it (and if we got here (no chaff)
            // then it'll be the only thing on the line, then we trace backward
            if ( blocks[it].match( postcode ) ) {
                var cursor = 0;
                for ( cursor = (it - 1); cursor >= 0; cursor-- ) {
                    var block = blocks[cursor];
                    //if ( block.length > 40 ) { break }
                    if ( block.match(/\n/) ) { break }
                    if ( block.match(/http:/) ) { break }
                    if ( block.match(/\baddress/i) ) { break }
                    foundAtoms.unshift( block );
                }
                break;
            }
        }

        if ( foundAtoms.length ) {
            addresses[i] = [ foundAtoms.join(', '), address[0], address[1] ];
        } else {
            deletedOnTheFly = true;
            addresses[i] = undefined;
        }
    }

    // Remove any we set to undefined
    if ( deletedOnTheFly ) {
        var newAddresses = [];
        for (var i=0; i < addresses.length; i++) {
            if ( addresses[i] ) {
                newAddresses.push( addresses[i] );
            }
        }
        addresses = newAddresses;
    }

    // Now we have some rough-hewn addresses, attempt to clean out any extra
    // data we captured
    for (var i=0; i < addresses.length; i++) {

        var prefix   = addresses[i][0];
        var postcode = addresses[i][1];
        var country  = addresses[i][2];

        // General address prefixing stuff to remove
        prefix = prefix.replace(/^.*(Registered Offices?( is| are)?|Tel|Telephone|Website|Fax|Address)\s*:\s*/mi, '');

        // Characters used for splitting atoms -> ,s
        prefix = prefix.replace(/[\n|]/g, ',');
        prefix = prefix.replace(/\u2022/g, ',');
        prefix = prefix.replace(/%u2022/g, ',');

        // Split it up in to parts, either by comma...
        prefix = prefix.replace(/,+/g, ',');
        prefix = prefix.replace(/,\s*$/g, '');
        var atoms = prefix.split(/,/);

        // Or on double-spaces if that didn't work
        if ( atoms.length == 1 ) {
            if ( atoms[0].match(/\s\s/) ) {
                atoms = atoms[0].split(/\s\s/);
            }
        }

        // Clean and sort atoms, including trying to get street numbers on their
        // own line on to the right line...
        var postAtoms = [];     // Accumulate in to this
        var orphan_number = ''; // Orphan number
        for (var ii = 0; ii < atoms.length; ii++) {
            var atom = atoms[ii];

            atom = atom.replace(/^\s*registered offices?( is| are)?/, '');
            atom = atom.replace(/^\s*\*\s*/, '' );
            atom = atom.replace(/^\s+/, '' );
            atom = atom.replace(/\s+$/, '' );
            atom = atom.replace(/\s+/g, ' ');
            atom = atom.replace(/,$/, '' );

            var number_only = atom.match(/^\d[ \d\-ab]*$/i);
            if ( number_only ) {
                orphan_number = atom;
            } else if ( atom.length && atom.length < 38 ) {
                if ( orphan_number ) {
                    atom = orphan_number + ' ' + atom;
                    orphan_number = undefined;
                }
                postAtoms.push( atom )
            }
        }

        // Clean up postcodes with too many delimiting spaces
        postcode = postcode.replace(/\s+/g, ' ');

        var title = postAtoms[0];
        if ( title == undefined || ! title.length ) {
            title = postcode;
        }

        addresses[i] = toolkit.addressFromFields({
            'atoms': postAtoms,
            'title': title,
            'country': country,
            'postcode': postcode
        });

    }

    return addresses;
}
