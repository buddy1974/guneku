/*
 * Some helper functions so allow sliding up / down elements
 *
 */
require('../less/slide.less');
/**
 * Add the necessary classes so we don't need to care if an element is slidable or not.
 *
 */
function prepareElement(elm:HTMLElement) {
    if (!elm.classList.contains('eg-slidable')) {
        if (!(elm.style.display === 'none')) {
            elm.classList.add('eg-slidable-active');
        }
        elm.classList.add('eg-slidable');
        elm.style.display = 'block';
    }
}

function slideToggle(elm:HTMLElement) {
    prepareElement(elm);

    if (!elm.classList.contains('eg-slidable-active')) {
        slideDown(elm);
    } else {
        slideUp(elm);
    }
}

function slideDown(elm:HTMLElement) {
    prepareElement(elm);

    elm.classList.add('eg-slidable-active');
    elm.style.height = 'auto';

    var height = elm.clientHeight + 'px';

    elm.style.height = '0px';

    setTimeout(() => {
        elm.style.height = height;
    }, 0);
}

function slideUp(elm:HTMLElement) {
    prepareElement(elm);

    elm.style.height = '0px';
    elm.addEventListener('transitionend', () => {
        elm.classList.remove('eg-slidable-active');
    }, {
        once: true
    });
}

export {slideToggle, slideUp, slideDown}
