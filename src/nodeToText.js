
exports.nodeToText = function ( elem ) {
    var text = '';
    try {
        text = elem.textContent.replace(/\n/g, ' ');
        return text;
    } catch (e) {1;}
    try {
        if ( elem.nodeType == 3 ) {
            text = elem.nodeValue;
        } else if ( elem.noteType == 1 ) {
            text = elem.innerText.replace(/\n/g, ' ');
            return text;
        }
    } catch (e) {1;}

    return text;
}