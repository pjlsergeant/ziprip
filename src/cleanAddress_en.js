
// These are Street Name atoms. The clean algorithm says that an address
// starts on the last line that contains one of these atoms and a number, OR the
// line before the last line that contains one of them if not.

var streetNameRE = new RegExp(' (Road|Rd|Square|Street|St\.?|Parkway|Pkwy\.?|Ave\.?|Avenue|Broadway|Boulevard|Blvd.?|Lane|Terrace|Place|Gardens|Yard|Court|Way|Drive|Dr\.?|lazy)( (north|west|south|east))?$', 'i');

exports.cleanAddress = function (atomsOriginal) {

    // Reverse the address atoms
    var atoms = atomsOriginal.reverse();

    // This is where we'll store atoms we want to keep
    var newAtoms = [];

    for (var i = 0; i < atoms.length; i++) {

        // Add this atom to the list
        newAtoms.unshift( atoms[i] );

        // If it's a street name
        if ( atoms[i].match( streetNameRE ) ) {
            // And it has a number, then break
            if ( atoms[i].match(/\d/) ) {
                break;
            // Otherwise, try and add the next item too, and then break
            } else {
                if ( (i+1) != atoms.length ) {
                    newAtoms.unshift( atoms[i+1] );
                    break;
                }
            }
        }
    }

    // TODO: This is where we should be taking a copy, but aren't...
    return newAtoms;
}
