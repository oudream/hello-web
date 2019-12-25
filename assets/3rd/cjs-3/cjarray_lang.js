(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjContainer = cjs.CjContainer || {};
    cjs.CjContainer = CjContainer;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjContainer;
    }

    CjContainer.toString = Object.prototype.toString;

    if (CjContainer.hasOwnProperty('findInArray')) return;

    /**
     *
     * @param array
     * @param elem
     * @returns {number}
     */
    CjContainer.findInArray = function(array, elem) {
        if ( array == null || array == undefined) {
            return -2;
        } else if (array.length == 0) {
            return -1;
        }
        for ( let i = 0; i < array.length; i++ ) {
            if ( elem == array[i] ) {
                return i;
            }
        }

        return -1;
    };

})();
