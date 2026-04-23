function removeElement(array, elm) {
    const index = array.indexOf(elm);
    if (index > -1) {
        array.splice(index, 1);
    }
}

function mergeObjects(defaults, options) {
    if (options === null || defaults === null) {
        return defaults;
    }

    for (let key in options) {
        defaults[key] = options[key];
    }

    return defaults;
}

/**
 * returns the width of an element.
 * @param el HTMLElement
 * @return {number}
 */
function  getElementWidth(el) {
    if (!el) return 0;
    return parseFloat(getComputedStyle(el, null).width.replace("px", ""));
}

/**
 * returns the height of an element.
 * @param el HTMLElement
 * @return {number}
 */
function  getElementHeight(el) {
    if (!el) return 0;
    return parseFloat(getComputedStyle(el, null).height.replace("px", ""));
}

/**
 * calculates the border of the given elements with the given properties
 */
function calcBorderWidth(elements, properties) {
    let sum = 0;

    for (let i=0; i<elements.length; i++) {
        let cSSStyleDeclaration = getComputedStyle(elements[i], null);
        for (let j=0; j<properties.length; j++) {
            let value = parseFloat( cSSStyleDeclaration[properties[j]] );
            if (!isNaN(value)) {
                sum += value;
            }
        }
    }

    return sum;
}

function addUrlHashParameter(initialUrl, key, value) {
    let url = removeUrlHashParameter(initialUrl, key),
        fragments = url.split('#'),
        urlpart = fragments[0],
        hashparts = fragments.length>1? fragments[1].split("&") : [],
        result;

    hashparts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));

    if (hashparts.length>0) {
        result = urlpart + '#' + hashparts.join('&');
    } else {
        result = urlpart;
    }

    return result;
}

function getUrlHashParameterValue(url, key) {
    let fragments=url.split('#'),
        hashparts = fragments.length>1? fragments[1].split("&") : [],
        result;

    if (hashparts.length>0)
    {
        let prefix= encodeURIComponent(key)+'=';

        for (let i=0; i<hashparts.length; i++) {
            if (hashparts[i].indexOf(prefix, 0) === 0) {
                result = hashparts[i].replace(prefix, '');
            }
        }
    }

    return result;
}

function removeUrlHashParameter(url, key) {
    let fragments=url.split('#'),
        urlpart= fragments[0],
        hashparts = fragments.length>1? fragments[1].split("&") : [],
        result;

    if (hashparts.length>0)
    {
        let prefix= encodeURIComponent(key)+'=',
            newHashParts = [];

        for (let i=0; i<hashparts.length; i++) {
            if (hashparts[i].indexOf(prefix, 0) === 0) {

            } else {
                newHashParts.push(hashparts[i]);
            }
        }
        hashparts = newHashParts;
    }

    if (hashparts.length>0) {
        result = urlpart + '#' + hashparts.join('&');
    } else {
        result = urlpart;
    }

    return result;
}

function addUrlParameter(initialUrl, key, value) {
    let url = removeUrlParameter(initialUrl, key),
        fragments = url.split('#'),
        urlparts= fragments[0].split('?'),
        result;

    if (urlparts.length === 1) {
        result = urlparts[0] + '?' + encodeURIComponent(key) + "=" + encodeURIComponent(value);
    } else {
        result = urlparts.join('?') + '&' + encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }

    if (fragments.length>1) {
        return result + '#' + fragments[1];
    }

    return result;
}

function removeUrlParameter(url, key) {
    let fragments=url.split('#'),
        urlparts= fragments[0].split('?'),
        result;

    if (urlparts.length>1)
    {
        let prefix= encodeURIComponent(key)+'=';
        let pars= urlparts[1].split('&');

        for (let i=0; i<pars.length; i++) {
            if (pars[i].indexOf(prefix, 0) === 0) {
                pars.splice(i, 1);
            }
        }
        if (pars.length > 0) {
            result = urlparts[0] + '?' + pars.join('&');
        }
        else {
            result = urlparts[0];
        }
    }
    else {
        result =  urlparts[0];
    }

    if (fragments.length>1) {
        return result + '#' + fragments[1];
    }

    return result;
}

function setCSSStyle (nodes, style, value) {
    for (let i=0; i<nodes.length; i++) {
        nodes[i].style[style] = value;
    }
}

function getOuterHeight(el) {
    let height = el.offsetHeight;
    let style = getComputedStyle(el);

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
}

/**
 *
 * @param node HTMLElement
 * @return HTMLElement[]
 */
function getParents(node) {
    let parents = [];

    if (node === null) {
        return parents;
    }

    while(node.parentElement != null) {
        let parent = node.parentElement;
        parents.push(parent);
        node = parent;
    }
    return parents;
}

/**
 * Search the parent matching a selector and return it.
 *
 * @param node HTMLElement
 * @param query string
 */
function getParent(node, query) {
    let nodes = getParents(node);
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].matches(query)) {
            return nodes[i];
        }
    }
    return null;
}

/**
 * set the content as innerHTML and executes the includes Script-Tags
 *
 * @param htmlElement HTMLElement
 * @param newContent string
 */
function insertAndExecute(htmlElement, newContent) {
    htmlElement.innerHTML = newContent;
    //we need a clone of that array.
    let scripts = Array.prototype.slice.call(htmlElement.getElementsByTagName("script"));
    for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src !== "") {
            let tag = document.createElement("script");
            tag.src = scripts[i].src;
            document.getElementsByTagName("head")[0].appendChild(tag);
        }
        else {
            try {
                eval(scripts[i].innerHTML);
            } catch (err) {
                console.error(err);
            }
        }
    }
}

/**
 * Loops over an array and executes the callback with it.
 *
 * @param elements array
 * @param callback Function
 * @return int number of executions of the callback method.
 */
function forEach(elements, callback) {
    if (!elements) {
        return 0;
    }
    for(let i=0; i<elements.length; i++) {
        callback(elements[i], i);
    }

    return elements.length
}
/*!
 * Serialize all form data into a query string
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * Modified to use any HTML element instead of a form element.
 * @param  {Node}   form The form container to serialize
 * @return {String}      The serialized form data
 */
var serializeForm = function (form) {

    // Setup our serialized data
    var serialized = [];

    let inputElements = form.querySelectorAll('input,select,textarea');
    // Loop through each field in the form
    for (var i = 0; i < inputElements.length; i++) {

        var field = inputElements[i];

        // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
        if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;

        // If a multi-select, get all selections
        if (field.type === 'select-multiple') {
            for (var n = 0; n < field.options.length; n++) {
                if (!field.options[n].selected) continue;
                serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[n].value));
            }
        }

        // Convert field data to a query string
        else if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
            serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
        }
    }

    return serialized.join('&');

};

export { getOuterHeight, removeElement, addUrlHashParameter, calcBorderWidth, mergeObjects, getElementWidth, getElementHeight, addUrlParameter, getUrlHashParameterValue, removeUrlHashParameter, removeUrlParameter, setCSSStyle, getParents, serializeForm, getParent, insertAndExecute, forEach };
