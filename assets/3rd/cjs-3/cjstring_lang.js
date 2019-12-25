(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjString = cjs.CjString || {};
    cjs.CjString = CjString;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjString;
    }

    CjString.toString = Object.prototype.toString;

    if (CjString.hasOwnProperty('equalCase')) return;

  /**
   * equal ignore case
   * @param str1
   * @param str2
   * @returns {boolean}
   */
    CjString.equalCase = function(str1, str2) {
        let r = false;
        if (typeof str1 === 'string' && typeof str2 === 'string') {
            r = str1.toLowerCase() === str2.toLowerCase();
        }
        return r;
    };

  /**
   *
   * @returns {string}
   * sample : CjString.format('{0} - {1}', 123, 'abc')
   */
    CjString.format = function() {
        if (arguments.length === 0) {
            return null;
        }
        let sSource = arguments[0];
        let args = arguments;
        let i = 0;
        let r = sSource.replace(/\{\d+\}/g,
      function(m) {
          i++;
          return args[i];
      });
        return r;
    };

  /**
   * add commas(.)
   * @param nStr
   * @returns {string}
   * Usage:  addCommas(12345678);
   * result: 12,345,678
   */
    CjString.addCommas = function addCommas(nStr) {
        nStr += '';
        let x = nStr.split('.');
        let x1 = x[0];
        let x2 = x.length >= 1 ? '.' + x[1] : '';
        let rgx = /(d+)(d{3})/;

        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1 + x2;
    };

  /**
   * pad zero
   *
   * @param num, n
   * @returns {*}
   * sample1 : padZero(1.23, 5) === '01.23'
   * sample1 : padZero(123, 5) === '00123'
   */
    CjString.padZero = CjString.addZero = function padZero() {
        let tbl = [];
        return function(num, n) {
            let len = n - num.toString().length;
            if (len <= 0) return num;
            if (!tbl[len]) tbl[len] = (new Array(len + 1)).join('0');
            return tbl[len] + num;
        };
    }();

    CjString.nullCheck = function(path, callback) {
        if (('' + path).indexOf('\u0000') !== -1) {
            let er = new Error('Path must be a string without null bytes');
            er.code = 'ENOENT';
            if (typeof callback !== 'function') {
                throw er;
            }
            process.nextTick(callback, er);
            return false;
        }
        return true;
    };

    CjString.urlToObject = function getJsonFromUrl(query) {
        let sQuery = query;
        if (sQuery == null) {
            if (typeof location === 'object') {
                sQuery = location.search.substr(1);
                if (!sQuery.length) {
                    let pos = location.href.indexOf('?');
                    if (pos === -1) return [];
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

  /**
   *
   * @param aryString<Array>
   * @param sKey<String>
   */
    CjString.findValueInArray = function(aryString, sKey) {
        let r = '';
        if (!sKey) return r;
        for (let i = 0; i < aryString.length; i++) {
            let arg = aryString[i];
            if (arg.startsWith(sKey)) {
                return arg.substring(sKey.length);
            }
        }
        return r;
    };
})();
