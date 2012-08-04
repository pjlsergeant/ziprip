
// Given a DOM object, returns a simple text representation
// Turns a DOM in to plain text. Requires a toolkit with at
//
exports.domToText = function ( dom, toolkit ) {

    // Nodes that we ignore the contents of
    var skipNodes = {
        'head':   1,
        'script': 1,
        'style':  1
    };

    // Nodes that map to text values
    var nodeMappings = {
        'h1_start'  : "\n\n",
        'h2_start'  : "\n\n",
        'h3_start'  : "\n\n",
        'p_start'   : "\n",
        'p_end'     : "\n",
        'span_start': "",
        'span_end'  : ", ",
        'div_start' : "\n",
        'div_end'   : "\n\n",
        'li_end'    : "\n",
        'br_end'    : "\n",
        'td_end'    : "\n\n"
    };

    var capture = '';

    function nodeGrab ( node, depth, path ) {

        var localName = '';
        if ( node.nodeName ) { localName = node.nodeName.toLowerCase(); }

        // Traverse in to iFrames too
        if ( localName == 'iframe' ) {
            var newDoc;
            try { newDoc = node.contentDocument.documentElement }
            catch (e) {}

            if (newDoc) {
                capture += "\n\n\n\n";
                nodeGrab( newDoc, depth + 1, path + ' > ' + localName  );
            }

        // 3: Text element
        } else if ( node.nodeType == 3 ) {
            var rText = toolkit.nodeToText(node);
            capture += rText;

        // 1: Tag element
        } else if ( node.nodeType == 1 ) {
            var insertion;

            // Skip some nodes...
            if ( skipNodes[ localName ] ) {
                return;

            // Lookup nodes whose start means newlines, and add them
            } else if ( insertion = nodeMappings[ localName + '_start' ] ) {
                capture += insertion;
            }

            // Recurse in to any child nodes
            for (var i = 0; i < node.childNodes.length; i++) {
                nodeGrab( node.childNodes[i], depth + 1, path + ' > ' + localName  );
            }

            // Add in any ending newlines
            if ( insertion = nodeMappings[ localName + '_end' ] ) {
                capture += insertion;
            }
        }
    }

    nodeGrab( dom.getElementsByTagName('html')[0], 0, '' );
    return capture;
}
