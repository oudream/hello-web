/**
 * Created by oudream on 2017/1/11.
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
    let CjHttp = cjs.CjHttp || {};
    cjs.CjHttp = CjHttp;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjHttp;
    }

    if (CjHttp.hasOwnProperty('urlToObject')) return;

    CjHttp.urlToObject = function urlToObject(query) {
        let sQuery = query;
        if (sQuery == null) {
            if (typeof location === 'object') {
                sQuery = location.search.substr(1);
                if (!sQuery.length) {
                    let pos = location.href.indexOf('?');
                    if (pos == -1) return [];
                    sQuery = location.href.substr(pos + 1);
                }
            }
        } else {
            let pos = sQuery.indexOf('?');
            if (pos !== -1) {
                sQuery = sQuery.substr(pos + 1);
            }
        }
        let result = {};
        sQuery.split('&').forEach(function(part) {
            if (!part) return;
            part = part.split('+').join(' '); // replace every + with space, regexp-free version
            let eq = part.indexOf('=');
            let key = eq > -1 ? part.substr(0, eq) : part;
            let val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
            let from = key.indexOf('[');
            if (from === -1) result[decodeURIComponent(key)] = val;
            else {
                let to = key.indexOf(']');
                let index = decodeURIComponent(key.substring(from + 1, to));
                key = decodeURIComponent(key.substring(0, from));
                if (!result[key]) result[key] = [];
                if (!index) result[key].push(val);
                else result[key][index] = val;
            }
        });
        return result;
    };
})();
