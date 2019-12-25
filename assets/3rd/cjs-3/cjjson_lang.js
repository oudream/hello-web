(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjJson = cjs.CjJson || {};
    cjs.CjJson = CjJson;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjJson;
        if (!cjs.CjMeta) require('./cjmeta');
    }

    if (CjJson.hasOwnProperty('parse')) return;

    /**
     * parse
     * @param {string[]|string}sJsons
     * @param {object}dest
     * @return {*}
     */
    CjJson.parse = function parse(sJsons, dest) {
        if (!cjs.CjMeta) {
            throw new ReferenceError('CjMeta is required');
        }

        if ((sJsons instanceof Array) && sJsons.length >= 2) {} else {
            if (typeof sJsons === 'string') {
                let obj = JSON.parse(sJsons);
                if (dest) {
                    cjs.CjMeta.merge(dest, obj);
                    return dest;
                }
                return obj;
            }
            throw new TypeError('argument sJsons is required, sJsons is array of json string, and length >= 2');
        }

        let r = null;
        try {
            r = JSON.parse(sJsons[0]);
            if (dest) {
                cjs.CjMeta.merge(dest, r);
                r = dest;
            }
            for (let i = 1; i < sJsons.length; i++) {
                let sJson = sJsons[i];
                let obj = JSON.parse(sJson);
                cjs.CjMeta.merge(r, obj);
            }
        } catch (e) {
            r = null;
            console.log('except CjJson.load.');
        }

        return r;
    };

    CjJson.refer2object = function(obj, referObject) {
        if (typeof obj !== 'object' || typeof referObject !== 'object') {
            return;
        }
        let sNames = Object.getOwnPropertyNames(obj);
        for (let i = 0; i < sNames.length; i++) {
            let sName = sNames[i];
            if (referObject.hasOwnProperty(sName)) {
                let sType1 = typeof obj[sName];
                let sType2 = typeof referObject[sName];
                if (sType1 === sType2) {
                    if (sType1 === 'object') {
                        CjJson.refer2object(obj[sName], referObject[sName]);
                    }
                } else {
                    switch (sType2) {
                    case 'string':
                        obj[sName] = obj[sName].toString();
                        break;
                    case 'number':
                        obj[sName] = Number(obj[sName]);
                        break;
                    case 'boolean':
                        obj[sName] = Boolean(obj[sName]);
                        break;
                    }
                }
            }
        }
    };

    CjJson.fromJson = function(sJson, ReferClass) {
        if (typeof sJson !== 'string' && !(sJson instanceof String)) {
            return null;
        }
        try {
            let obj1 = JSON.parse(sJson);
            if (ReferClass) {
                let r = new ReferClass();
                this.refer2object(obj1, r);
            }
            return obj1;
        } catch (e) {
        }
        return null;
    };
})();
