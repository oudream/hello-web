/**
 * Created by oudream on 2016/12/7.
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
    let CjFunction = cjs.CjFunction || {};
    cjs.CjFunction = CjFunction;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjFunction;
    }

    if (CjFunction.hasOwnProperty('getFunctionName')) return;

    CjFunction.getFunctionName = function getFunctionName(fn) {
        return fn && ( fn.name || this.toString().match(/function\s*([^(]*)\(/)[1] );
    };

    CjFunction.getFunctionObject = function getFunctionObject(fn, args) {
        if (typeof fn !== 'function') {
            return {
                type: null,
                name: '',
                content: '',
                argumentsLength: null,
                arguments: null,
            };
        }
        return {
            type: typeof fn,
            name: fn.name || '',
            content: fn.toString(),
            arguments: args,
        };
    };

    CjFunction.getFunctionString = function getFunctionString(fn, args) {
        return JSON.toString(CjFunction.getFunctionObject(fn, args));
    };
})();
