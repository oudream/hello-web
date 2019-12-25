/**
 * Created by oudream on 2016/12/28.
 */

(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjEncoding = cjs.CjEncoding || {};
    cjs.CjEncoding = CjEncoding;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjEncoding;
    }

    if (CjEncoding.hasOwnProperty('base64Encode')) return;

    CjEncoding.base64Encode = function base64Encode(str) {
        if (typeof exports === 'object' && typeof global === 'object') {
            require('buffer');
            return new Buffer(str).toString('base64');
        } else {
            return window.btoa(str);
        }
    };

    CjEncoding.base64Decode = function base64Decode(str) {
        if (typeof exports === 'object' && typeof global === 'object') {
            require('buffer');
            return new Buffer(str, 'base64').toString(); // 'ascii'
        } else {
            return window.atob(str);
        }
    };
})();
