(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjMeta = cjs.CjMeta || {};
    cjs.CjMeta = CjMeta;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjMeta;
    }

    if (CjMeta.hasOwnProperty('checkStrict')) return;

    CjMeta.checkStrict = '(function() { return !this; })();';

  /**
   * get object's ClassName
   *
   * @param obj
   * @returns {*}
   */
    CjMeta.getObjectClassName = function(obj) {
        if (obj && obj.constructor && obj.constructor.toString()) {
      /*
       *  for browsers which have name property in the constructor
       *  of the object,such as chrome
       */
            if (obj.constructor.name) {
                return obj.constructor.name;
            }
            let str = obj.constructor.toString();
      /*
       * executed if the return of object.constructor.toString() is
       * "[object objectClass]"
       */

            let arr;
            if (str.charAt(0) === '[') {
                arr = str.match(/\[\w+\s*(\w+)\]/);
            } else {
        /*
         * executed if the return of object.constructor.toString() is
         * "function objectClass () {}"
         * for IE Firefox
         */
                arr = str.match(/function\s*(\w+)/);
            }
            if (arr && arr.length === 2) {
                return arr[1];
            }
        }
        return undefined;
    };

    CjMeta.objectTypeRegexp = /^\[object (.*)\]$/;
  /**
   *
   * @param obj
   * @returns {*}
   * usage : let a = []; getType(a) === 'Array'
   */
    CjMeta.getType = function getType(obj) {
        let type = Object.prototype.toString.call(obj).match(CjMeta.objectTypeRegexp)[1].toLowerCase();
    // Let "new String('')" return 'object'
        if (typeof Promise === 'function' && obj instanceof Promise) return 'promise';
    // PhantomJS has type "DOMWindow" for null
        if (obj === null) return 'null';
    // PhantomJS has type "DOMWindow" for undefined
        if (obj === undefined) return 'undefined';
        return type;
    };

  /**
   * Merge the property descriptors of `src` into `dest`
   *
   * @param {object} dest Object to add descriptors to
   * @param {object} src Object to clone descriptors from
   * @param {boolean} [redefine=true] Redefine `dest` properties with `src` properties
   * @returns {object} Reference to dest
   * @public
   */
    CjMeta.merge = function(dest, src, redefine) {
        if (!dest) {
            throw new TypeError('argument dest is required');
        }

        if (!src) {
            throw new TypeError('argument src is required');
        }

        if (redefine === undefined) {
      // Default to true
            redefine = true;
        }

        Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
            if (!redefine && hasOwnProperty.call(dest, name)) {
        // Skip desriptor
                return;
            }

      // Copy descriptor
            let descriptor = Object.getOwnPropertyDescriptor(src, name);
            Object.defineProperty(dest, name, descriptor);
        });

        return dest;
    };

    /**
     * 对象和数组复制
     * @param elem：对象或数组
     * @returns {*}
     */
    CjMeta.clone = function(elem) {
        if (elem && typeof elem === 'object') {
            if (elem.length) {
                var _elem = [];
                for (let i = 0; i < elem.length; i++) {
                    _elem[i] = elem[i];
                }

                return _elem;
            } else {
                var _elem = {};
                for (let attr in elem) {
                    _elem[attr] = elem[attr];
                }

                return _elem;
            }
        }

        return null;
    };

    /**
     * 判断对象是否有属性（或者指定属性）
     * @param obj：待判断对象
     * @param propertyName：特定属性，如不传入，将判断是否空对象
     * @returns {boolean}
     */
    CjMeta.hasProperty = function(obj, propertyName) {
        for (let attr in obj) {
            if (propertyName != undefined) {
                if (attr == propertyName) {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    };

    /**
     * 新建标签元素
     * @param tagName：标签名，input,button...
     * @param attrs：属性对象,{'id':'xx','className':'xxx'...}
     * @param parent：父标签对象
     * @returns {Element}：元素对象
     */
    CjMeta.createElement = function(tagName, attrs, parent) {
        let elem = document.createElement(tagName);
        let ret;

        for (let attr in attrs) {
            if (typeof(attrs[attr]) != 'function') {
                elem[attr] = attrs[attr];
            }
        }

        /** 针对父对象是Dom对象 */
        if (parent && ((typeof HTMLElement==='object' && parent instanceof HTMLElement) || (parent.nodeType && parent.nodeType===1))) {
            parent.appendChild(elem);
            ret = elem;
        }
        /** 针对父对象是jQuery对象 */
        else if (parent && parent.length && (typeof jQuery==='function' || typeof jQuery==='object') && parent instanceof jQuery) {
            ret = $(elem);
            parent.append(ret);
        } else if (parent == undefined || parent == null) {
            ret = elem;
        }

        return ret;
    };

    /**
     * 检测对象是否为空
     * @param obj: 对象
     * @returns {boolean}
     */
    CjMeta.isEmptyObject = function(obj) {
        let t;
        for (t in obj) {
            return !1;
        }
        return !0;
    };
})();
