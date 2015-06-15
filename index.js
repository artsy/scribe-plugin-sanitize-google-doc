//
// A [Scribe](https://github.com/guardian/scribe) plugin cleaning html pasted
// from Google docs. Some code copied from The Guardian's sematic elements:
// https://github.com/guardian/scribe-plugin-formatter-html-ensure-semantic-elements
//
(function() {

  var scribePluginSanitizeGoogleDoc = function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('sanitize', formatter);
    }
  }

  // Copies the attributes from one node to another
  var copyAttributes = function(fromNode, toNode) {
    if (fromNode.hasAttributes()) {
      for (var i = 0, ii = fromNode.attributes.length; i < ii; i++) {
        var attr = fromNode.attributes[i].cloneNode(false);
        toNode.attributes.setNamedItem(attr);
      }
    }
  }

  // Moves the children elements from one node into another
  var moveChildren = function(fromNode, toNode) {
    var nextChild;
    var child = fromNode.firstChild;
    while (child) {
      nextChild = child.nextSibling;
      toNode.appendChild(child);
      child = nextChild;
    }
  }

  // Replaces a node with a new node of different name
  var replaceNode = function(node, nodeName) {
    var newNode = document.createElement(nodeName);
    moveChildren(node, newNode);
    copyAttributes(node, newNode);
    node.parentNode.replaceChild(newNode, node);
  }

  // Recursively traverse the tree replacing styled spans with their more
  // appropriate bold, italics, etc. tags.
  var traverse = function(parentNode) {
    var el = parentNode.firstElementChild;
    var nextSibling;
    while (el) {
        nextSibling = el.nextElementSibling;
        traverse(el);
        if(el.nodeName == 'SPAN') {
          if (el.style.fontWeight == 'bold') {
            if(el.style.fontStyle == 'italic'){
              el.removeAttribute('style');
              el.style.fontStyle = 'italic';
            }else{
              el.removeAttribute('style');
            }
            replaceNode(el, 'B');
          } else if (el.style.fontStyle == 'italic') {
            el.removeAttribute('style');
            replaceNode(el, 'I');
          }
        }
        el = nextSibling;
    }
  }

  // Main `registerHTMLFormatter function
  var formatter = function (html) {
    if (typeof html === 'string') {
        var node = document.createElement('div');
        node.innerHTML = html;
        traverse(node);
        return node.innerHTML;
    } else {
        traverse(html);
        return html
    }
  }

  // Export for CommonJS & window global. TODO: AMD
  if (typeof module != 'undefined') {
    module.exports = scribePluginSanitizeGoogleDoc;
  } else {
    window.scribePluginSanitizeGoogleDoc = scribePluginSanitizeGoogleDoc;
  }
})();