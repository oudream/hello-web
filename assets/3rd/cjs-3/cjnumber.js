(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjNumber = cjs.CjNumber || {};
    cjs.CjNumber = CjNumber;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjNumber;
    }

    if (CjNumber.hasOwnProperty('toOrdinal')) return;

  /**
   *
   * @param num
   * @returns {string}
   * sample : CjNumber.toOrdinal( yourNumber )
   */
    CjNumber.toOrdinal = function(num) {
        let num2 = num - 0;
        let n = num2 % 100;
        let suffix = ['th', 'st', 'nd', 'rd', 'th'];
        let ord = n < 21 ? (n < 4 ? suffix[n] : suffix[0]) : (n % 10 > 4 ? suffix[0] : suffix[n % 10]);
        return num2 + ord;
    };

    CjNumber.isNumber = function(num) {
        return Number.isNaN(parseInt(num));
    };
})();
