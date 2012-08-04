
// This is the core function. It accepts a DOM, a toolbox that has a
// well-specified interface, and a list of extractors to try and use
exports.extractUsing = function ( dom, url, toolkit, stash, extractors ) {

    // Reload Sizzle with this DOM
    toolkit.loadSizzle( dom );

    // Where we'll store the addresses we find
    var addresses = [];

    // Loop over each extractor
    for (var i = 0; i < extractors.length; i++) {

        // Attempt to find addresses using that
        var found = extractors[i]( dom, url, toolkit, stash );

        // If we did, we can break the loop
        if ( found && found.length > 0 ) {
            addresses = found;
            break;
        }
    }

    // Clean the addresses we found using the cleanAddress() function in the
    // toolkit
    for (var i = 0; i < addresses.length; i++) {
        if ( addresses[i]['via'] == 'Generic' ) {
            addresses[i]['atoms'] = toolkit.cleanAddress( addresses[i]['atoms'] );
        }
    }

    // It's possible we found some geocoding hints in the Google extractor, but
    // an address elsewhere. If we found a coordinate hint, and just one address
    // then we match those up now.
    if ( addresses.length == 1 ) {
        if ( stash['hint'] ) {
            if (! addresses[0]['lat'] ) {
                addresses[0]['lat'] = stash['hint'][0];
                addresses[0]['lon'] = stash['hint'][1];
            }
        }
    }

    return addresses;
};