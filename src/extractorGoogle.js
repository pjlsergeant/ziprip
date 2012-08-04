
// All sortsa Google magic
exports.extractor = function ( dom, url, toolkit, stash ) {

    // RHS Blocks - these are inline address blocks normally in Google results
    // pages.
    var rhsBlock = toolkit.sz('#rhs_block .rhsvw a[href*="daddr"]', dom)[0];
    if ( rhsBlock ) {
        var found = extractDURLS([ rhsBlock ])[0];
        if ( found ) {
            var title = toolkit.sz('#rhs_block .rhsvw b', dom)[0];
            if ( title && toolkit.nodeToText(title) ) {
                found['title'] = toolkit.nodeToText(title);
            }
            found['via'] = 'Google RHS';
            return [found];
        }
    }


    // PP Marker, which is a big chunk of json with useful stuff in
    var ppMarkers = toolkit.sz('#pp-marker-json', dom)[0];
    if ( ppMarkers ) {
        var markerContent = toolkit.nodeToText(ppMarkers);
        var addresses = extractPPMarker( markerContent );
        if ( addresses.length ) { return addresses }
    }


    // Google IDs
    var gurls = toolkit.sz('div[g\\:url]', dom);
    var found = extractGURLS(gurls);
    if ( found.length ) { return found }


    // Driving instructions
    var durls = toolkit.sz('a[href*="daddr"]', dom);
    var dfound = extractDURLS( durls );
    if ( dfound.length ) { return dfound }

    // Address hinting? We pull out Google's coords for use on other addresses
    // found by other extractors
    var hints = toolkit.sz('a[href*="mapclient=jsapi"]', dom);
    if ( hints.length == 1 ) {
        var url = hints[0].getAttribute('href');
        url = toolkit.uri(url);
        if (url.host().match('maps.google') ) {
            var ll = url.decode( url.getQueryParamValue('ll') ).split(',');
            if ( ll[0] && ll[1] ) {
                stash.hint = ll;
            }
        }
    }

    // Google Driving URLs
    function extractDURLS ( durls ) {
        var addresses = [];
        for (var i = 0; i < durls.length; i++ ) {
            var durl = durls[i];
            var url = toolkit.uri( durl.getAttribute('href') );

            // Gotta be Google Maps URLs, for starters
            if (! url.host().match('maps.google') ) { continue }

            // Pull out the 'daddr' attribute
            var daddr = url.decode( url.getQueryParamValue('daddr') );

            // Parse that
            var parsedAddress = toolkit.addressFromString( toolkit, daddr )[0];
            if (! parsedAddress ) { continue; }

            // Try and get the coordinates for it
            var geocode = url.decode( url.getQueryParamValue('geocode') );
            if ( geocode ) {
                var atoms = geocode.split(/,/);
                if ( atoms.length != 3 ) { continue }
                parsedAddress['lat'] = atoms[1];
                parsedAddress['lon'] = atoms[2];
                parsedAddress['via'] = 'Google Driving';
            } else {
                continue;
            }

            // Make a ditch at the title if there was just one...
            if ( durls.length == 1 ) {
                var lclbox = toolkit.sz('*[id="lclbox"]', dom)[0];
                if (lclbox) {
                    var title = toolkit.sz('*[class="wrt"]',lclbox)[0];
                    if ( title ) {
                        parsedAddress['title'] = toolkit.nodeToText(title);
                    }
                }
            }

            addresses.push( parsedAddress );
        }

        return addresses;
    }


    function extractGURLS ( gurls ) {
        var addresses = [];
        var seen = {};

        for (var i = 0; i < gurls.length; i++) {
            var url = gurls[i].getAttribute('g:url');

            // Only process each one once
            if ( seen[url] ) { continue; }
            seen[url] = 1;

            // Remove the preceeding ID crap
            url = url.replace(/^ID:\/\//, '');

            // Now we can treat it like a real URL
            url = toolkit.uri( url );
            if (! url.host().match('maps.google') ) { continue }

            var address = url.decode( url.getQueryParamValue('q') );

            var parts = address.split(/loc\:/);
            var title  = parts[0];
            var street = parts[1];

            // Remove phone numbers from titles
            title = title.replace(/[\-\d\(\)\ \+]+$/g, '');
            title = title.replace(/\s*$/g, '');
            title = title.replace(/^\s*/g, '');
            title = title.replace(/\s+/g, ' ');

            var parsedAddress = toolkit.addressFromString( toolkit, street )[0];

            if (! parsedAddress ) { continue; }

            var ll = url.getQueryParamValue('sll').split(/,/);
            parsedAddress['lat'] = ll[0];
            parsedAddress['lon'] = ll[1];
            parsedAddress['title'] = title;
            parsedAddress['via'] = 'Google g:url';
            addresses.push( parsedAddress );
        }

        return addresses;
    }


    function extractPPMarker (text) {

        // Our JSON parser unhappy with Google-style bare JSON keys
        text = text.replace(/(\w+):/g, "\"$1\":");

        // It works, or we don't care...
        try {
            var jsonD  = toolkit.json.parse( text );
            var title  = jsonD['infoWindow']['title'];
            var asText = jsonD['infoWindow']['addressLines'].join(',');
            var lat    = jsonD['latlng']['lat'] + 0;
            var lon    = jsonD['latlng']['lng'] + 0;
        } catch ( e ) { return [] }

        if (! asText.length ) { return [] }

        var parsedAddress = toolkit.addressFromString( toolkit, asText )[0];

        if (! parsedAddress ) { return [] }

        if ( title.length ) { parsedAddress['title'] = title }

        if ( lat && lon ) {
            parsedAddress['lat'] = lat;
            parsedAddress['lon'] = lon;
        }

        parsedAddress['via'] = 'Google pp-marker';

        return [parsedAddress];
    }


}

