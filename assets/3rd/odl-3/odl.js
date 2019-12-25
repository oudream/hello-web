// memory, db, file, communication, ui.web, ui.desktop
// memory is center, map to db : file : communication : ui.web : ui.desktop .
// memory [ attrs, container ]
// interface.spec : { normalize } : pages, storage
// quantity.spec : 1.string/number/object is single, 2.array is multi
// titleName : refer-odc.attr.name
// key keys sorts : root.spec.container , page.spec , storage.spec.table
(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.odl = global.odl || {};
    }
    else if (typeof window === 'object') {
        window.odl = window.odl || {};
        if (!window.setImmediate) {
            window.setImmediate = function(func, args) {
                return window.setTimeout(func, 0, args);
            };
            window.clearImmediate = window.clearTimeout;
        }
    }
    else {
        throw Error('odl only run at node.js or web browser');
    }

    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = odl;
    }

    odl._odcs = [];
    odl._nplugins = [];

    odl.clone = function odlClone(item) {
        if (!item) {
            return item;
        } // null, undefined values check

        var types = [Number, String, Boolean],
            result;

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function(type) {
            if (item instanceof type) {
                result = type(item);
            }
        });

        if (typeof result == "undefined") {
            if (Object.prototype.toString.call(item) === "[object Array]") {
                result = [];
                item.forEach(function(child, index, array) {
                    result[index] = odlClone(child);
                });
            }
            else if (typeof item == "object") {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode == "function") {
                    result = item.cloneNode(true);
                }
                else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    }
                    else {
                        // it is an object literal
                        result = {};
                        for (var i in item) {
                            result[i] = odlClone(item[i]);
                        }
                    }
                }
                else {
                    // depending what you would like here,
                    // just keep the reference, or create new object
                    if (false && item.constructor) {
                        // would not advice to do that, reason? Read below
                        result = new item.constructor();
                    }
                    else {
                        result = item;
                    }
                }
            }
            else {
                result = item;
            }
        }

        return result;
    };

    odl.checkMeta = function(odc) {
        return odc && odc.kind === 'odc' && odc.apiVersion && odc.metadata && odc.spec;
    };

    odl.getOdcs = function() {
        return this._odcs;
    };

    odl.findOdc = function(name) {
        return this._odcs.find(odc => odc.metadata.name === name);
    };

    odl.findNPlugin = function(kind) {
        return this._nplugins.find(nPlugin => nPlugin.kind === kind);
    };

    odl.registerNPlugin = function(nPlugin) {
        // console.assert(nPlugin && nPlugin.kind && nPlugin.normalize);
        if (!this.findNPlugin(nPlugin.kind)) {
            this._nplugins.push(nPlugin);
        }
    };

    odl.findNObj = function(odc, kind) {
        return odc.spec.ns.find(n => n.kind === kind);
    };

    odl.findReferTitleAttr = function(refer, kind) {
        // todo: refer key
        // only suport : one refer , attrs and key is string
        let odc = this.findOdc(refer.odc);
        if (!odc) return null;
        let np = this.findNPlugin(kind);
        if (!np) return null;
        let nObj = np.getSimilar(odc);
        if (!nObj) return null;
        return nObj.spec.attrs.find(a => a.name === refer.title);
    };

    odl.normalize = function(odc) {
        if (!this.checkMeta(odc)) {
            return false;
        }
        // normalize odc.spec.attrs
        odc.spec.attrs = this.Attr.normalize(odc);
        // normalize odc.spec.container
        odc.spec.container = this.Container.normalize(odc);
        // normalize _nplugins
        odc.spec.ns.forEach((nObj) => {
            let nPlugin = this.findNPlugin(nObj.kind);
            if (nPlugin) {
                nPlugin.normalize(odc, nObj);
            }
        });
        return true;
    };

    odl.register = function(odc) {
        if (this.normalize(odc)) {
            this._odcs.push(odc);
        }
    };

    odl.prepare = function() {
        this._odcs.forEach((odc) => {
            odc.spec.ns.forEach((nObj) => {
                let nPlugin = this.findNPlugin(nObj.kind);
                if (nPlugin) {
                    if (nPlugin.normalizeAfer) {
                        nPlugin.normalizeAfer(odc, nObj);
                    }
                }

            });
        });
    };

    odl.Attr = {
        meta: ['int', 'double', 'bool', 'string'],

        extend: ['int32', 'int64', 'enum', 'date'],

        completionAttr: function(attr) {
            // desc
            if (!attr.desc && attr.name) {
                attr.desc = attr.name;
            }
            // title
            if (!attr.title && attr.name) {
                attr.title = attr.name;
            }
            // titles
            if (attr.type === 'enum') {
                console.assert(Array.isArray(attr.scopes));
                if (!attr.titles || attr.titles.length === 0) {
                    attr.titles = [];
                    for (let i = 0; i < attr.scopes.length; i++) {
                        attr.titles.push(String(attr.scopes[i]));
                    }
                }
            }
            // minvalue maxvalue
            if (attr.type === 'int' || attr.type === 'double') {
                let bl1 = Array.isArray(attr.scopes) && attr.scopes.length > 0;
                let bl2 = bl1 && Array.isArray(attr.scopes[0]) && attr.scopes[0].length > 1;
                if (bl2 && (attr.minvalue === undefined || attr.maxvalue === undefined)) {
                    let vMin = attr.scopes[0][0];
                    let vMax = attr.scopes[0][1];
                    for (let i = 1; i < attr.scopes.length; i++) {
                        let arr = attr.scopes[i];
                        if (Array.isArray(arr) && attr.scopes[i].length > 1) {
                            if (attr.scopes[i][0] < vMin) {
                                vMin = attr.scopes[i][0];
                            }
                            if (attr.scopes[i][1] > vMax) {
                                vMax = attr.scopes[i][1];
                            }
                        }
                    }
                    attr.minvalue = vMin;
                    attr.maxvalue = vMax;
                }
            }
            // refer
            if (attr.refer && attr.refer.odc && attr.refer.title) {
                attr.refer.titleName = attr.refer.odc + '_' + attr.refer.title;
            }
        },

        /**
         *
         * @param attrs
         * @returns {Array|*}
         */
        normalize: function(odc) {
            let attrs = odc.spec.attrs;
            let r = [];
            for (let i = 0; i < attrs.length; i++) {
                let attr = attrs[i];
                let myAttr = this.attrs[attr.model];
                if (!myAttr) return attrs;
                let newAttr = {};
                Object.assign(newAttr, myAttr);
                Object.assign(newAttr, attr);
                this.completionAttr(newAttr);
                r.push(newAttr);
            }
            return r;
        },

        /**
         * merge attrs by name, if
         * @param attrs1
         * @param attrs2
         * @returns {*|Array|*}
         */
        mergeAttrs: function(attrs1, attrs2) {
            if (!Array.isArray(attrs1)) {
                return Array.isArray(attrs2) ? odl.clone(attrs2) : null;
            }
            if (!Array.isArray(attrs2)) {
                return odl.clone(attrs1);
            }
            let newAttrs = odl.clone(attrs1);

            for (let i = 0; i < attrs2.length; i++) {
                let attr2 = attrs2[i];
                let attr1 = newAttrs.find(attr => attr.name === attr2.name);
                if (attr1) {
                    Object.assign(attr1, attr2);
                }
                else {
                    newAttrs.push(attr2);
                }
            }
            return newAttrs;
        },

        attrs: {
            int: {
                type: 'int',
                isNull: true,
                regexp: '^\\d{1,15}$',
                maxLength: 15,
                minLength: 1,
                maxvalue: 0xFFFFFFFFFFFFF,
                minvalue: 0 - 0xFFFFFFFFFFFFF,
                scopes: []
            },
            int32: {
                type: 'int',
                isNull: true,
                regexp: '^\\d{1,9}$',
                maxLength: 9,
                minLength: 1,
                maxvalue: 0xFFFFFFFF,
                minvalue: 0 - 0xFFFFFFFF,
                scopes: []
            },
            int64: {
                type: 'int',
                isNull: true,
                regexp: '^\\d{1,15}$',
                maxLength: 15,
                minLength: 1,
                maxvalue: 0xFFFFFFFFFFFFF,
                minvalue: 0 - 0xFFFFFFFFFFFFF,
                scopes: []
            },
            double: {
                type: 'double',
                isNull: true,
                regexp: '^(-?\\d+)(\\.\\d+)?$',
                maxLength: 15,
                minLength: 1,
                scopes: []
            },
            bool: {
                type: 'bool',
                isNull: true,
                regexp: '^\\d{1,15}$',
                maxLength: 1,
                minLength: 1,
                scopes: []
            },
            string: {
                type: 'string',
                isNull: true,
                regexp: '',
                maxLength: 255,
                minLength: 1,
                scopes: []
            },
            date: {
                type: 'date',
                isNull: true,
                regexp: '^\\d{4}-\\d{1,2}-\\d{1,2}',
                maxLength: 23,
                minLength: 8,
                scopes: []
            },
            enum: {
                type: 'enum',
                isNull: true,
                regexp: '',
                maxLength: 23,
                minLength: 8,
                scopes: [],
                titles: [],
            }
        }
    };

    odl.Container = {

        /**
         *
         * @param container
         * @returns {any}
         */
        normalize: function(odc) {
            let container = odc.spec.container ? odc.spec.container : {};
            let r = Object.assign(container);
            if (Array.isArray(r.keys) && r.keys.length > 0) {
                let sKey = r.keys.find(ele => typeof ele === 'string' && ele.length > 0);
                r.key = odc.spec.attrs.find(ele => ele.name === sKey);
            }
            return r;
        },

    };

})();
