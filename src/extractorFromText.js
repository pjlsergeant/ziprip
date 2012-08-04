
// Generic extractor
exports.extractor = function ( dom, url, toolkit, stash ) {
    var documentAsText = toolkit.domToText( dom, toolkit );
    var addresses = toolkit.addressFromString( toolkit, documentAsText );
    for (var i = 0; i < addresses.length; i++) {
        addresses[i]['via'] = 'Generic';
    }
    return addresses;
}
