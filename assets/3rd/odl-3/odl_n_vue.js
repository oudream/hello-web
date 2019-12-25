(function() {
    'use strict';

    let odl = (typeof exports === 'object' && typeof global === 'object') ? global.odl : window.odl;

    odl.UiVueTable = {
        kind: 'ui.vue.table',

        _defaultWidth: {
            int: 80,
            int32: 60,
            int64: 80,
            double: 80,
            bool: 60,
            string: 120,
            date: 100,
            enum: 80
        },

        getSimilar: function(odc) {
            return odl.findNObj(odc, this.kind);
        },

        getSimilarByName: function(name) {
            let odc = odl.findOdc(name);
            return odc ? this.getSimilar(odc) : null;
        },

        completionAttr: function(attr) {
            // visible
            if (!attr.hasOwnProperty('visible')) {
                attr.visible = true;
            }
            if (!attr.hasOwnProperty('readonly')) {
                attr.readonly = false;
            }
        },

        /**
         *
         * @param odc
         * @param nObj
         * @returns {Error|null}
         */
        normalize: function(odc, nObj) {
            if (nObj.kind !== this.kind) {
                return new Error('nObj kind invalid!!');
            }
            if (!nObj.spec) nObj.spec = {};
            let spec = nObj.spec;
            // title
            if (!spec.title) {
                spec.title = {
                    title: odc.metadata.name
                };
            }
            // attrs
            let supperAttrs = odc.spec.attrs;
            if (!spec.attrs) spec.attrs = [];
            let attrs = spec.attrs;
            let newAttrs = odl.Attr.mergeAttrs(supperAttrs, attrs);
            for (let i = 0; i < newAttrs.length; i++) {
                let newAttr = newAttrs[i];
                this.completionAttr(newAttr);
            }
            spec.attrs = newAttrs;
            // spec.keys & spec.key
            if (Array.isArray(odc.spec.container.keys) && !spec.keys) {
                spec.keys = odl.clone(odc.spec.container.keys);
            }
            if (Array.isArray(odc.spec.container.sorts) && !spec.sorts) {
                spec.sorts = odl.clone(odc.spec.container.sorts);
            }
            if (Array.isArray(spec.keys) && spec.keys.length > 0) {
                let sKey = spec.keys.find(ele => typeof ele === 'string' && ele.length > 0);
                spec.key = spec.attrs.find(ele => ele.name === sKey);
            }
            return null;
        },

        /**
         *
         * @param odc
         * @param nObj
         * @returns {Error}
         */
        normalizeAfer: function(odc, nObj) {
            if (nObj.kind !== this.kind) {
                return new Error('nObj kind invalid!!');
            }
            let attrs = nObj.spec.attrs;
        },

        getFormats: function(name, type) {
            let formats = {
                formatSex: function(row, column) {
                    return row[column.property] == 1 ? '男' : row[column.property] == 0 ? '女' : '未知';
                },

                // double
                formatBool: function(row, column) {
                    return row[column.property] ? 'Y' : 'N';
                },

                // double
                formatDouble: function(row, column) {
                    let v = row[column.property];
                    if (typeof v === 'number') {
                        return row[column.property].toFixed(2);
                    }
                    return v;
                },

                // date
                formatDate: function(row, column) {
                    let dt = row[column.property];
                    if (dt) {
                        return String(dt.getFullYear()) + '-' + dt.getMonth() + '-' + dt.getDay();
                    }
                    return dt;
                },

                // time
                formatTime: function(row, column) {
                    let dt = row[column.property];
                    if (dt) {
                        return String(dt.getHours()) + ':' + dt.getMinutes() + ':' + dt.getSeconds();
                    }
                    return dt;
                },
            };

            let formatDefault = {
                int: null,
                int32: null,
                int64: null,
                double: formats.formatDouble,
                bool: formats.formatBool,
                string: null,
                date: formats.formatDate,
                enum: null,
            };

            return name && formats[name] ? formats[name] : formatDefault[type];
        },

        getSelects: function(scopes) {
            let r = {options: []};
            if (Array.isArray(scopes)) {
                scopes.forEach((s, i) => {
                    r.options.push({label:s, value: i})
                });
            } else {
                return null;
            }
            return r;
        },

        /**
         * attrs
         <el-table-column v-for="attr in attrs" :prop="attr.name" :label="attr.label" :width="attr.width" :formatter="attr.format" :sortable="attr.sortable" show-overflow-tooltip="attr.showOverflowTooltip">

         * @param nObj
         * @returns {[]}
         */
        getTableFields: function(nObj) {
            let r = [];
            let push = (name, a) => {
                let atr = {
                    name: name,
                    type: a.type,
                    maxLength: a.maxLength,
                    label: a.title,
                    width: this._defaultWidth[a.type],
                    format: this.getFormats(a.format,a.type),
                    sortable: true,
                    showOverflowTooltip: a.type === 'string' && a.maxLength > this._defaultWidth[a.type],
                    readonly: a.readonly,
                };
                if (a.type !== 'string' || a.type !== 'bool') {
                    atr.minvalue = a.minvalue;
                    atr.maxvalue = a.maxvalue;
                }
                if (a.type === 'enum') {
                    atr.select = this.getSelects(a.scopes);
                }
                r.push(atr);
                return atr;
            };
            nObj.spec.attrs.forEach(a => {
                if (a.visible) {
                    push(a.name, a);
                }
                if (a.refer) {
                    let ar = odl.findReferTitleAttr(a.refer, this.kind);
                    if (ar) {
                        let atr = push(a.refer.titleName, ar);
                        atr.from = {};
                        atr.from.refer = odl.clone(a.refer);
                        atr.from.prevAttr = a.name;
                        atr.readonly = a.readonly;
                    }
                }
            });
            if (r.length > 0) {
                r[r.length - 1].width = undefined;
                r[r.length - 1]['minWidth'] = 180
            }
            return r;
        },

        /**
         * attrs
         this.filter.options = [
         {
                    value: 'name',
                    label: '姓名',
                },
         {
                    value: 'addr',
                    label: '地址',
                },
         ]
         * @param nObj
         * @returns {[]}
         */
        getFilterFields: function(nObj) {
            let r = [];
            let attrs = nObj.spec.attrs;
            for (let i = 0; i < attrs.length; i++) {
                let attr = attrs[i];
                if (attr.visible) {
                    r.push({
                        value: attr.name,
                        label: attr.title,
                    });
                }
            }
            return r;
        },

        /**
         * attrs
         this.filter.options = [
         {
                    value: '%',
                    label: 'LIKE',
                },
         {
                    value: '>',
                    label: '>',
                },
         ]
         * @param nObj
         * @param attrName
         * @returns {[]}
         */
        getFilterOperations: function(nObj, attrName) {
            let r = [
                {
                    value: '=',
                    label: '=',
                }
            ];
            let attr = nObj.spec.attrs.find(a => a.name === attrName);
            if (attr) {
                if (attr.type === 'string') {
                    r.push({
                        value: '%',
                        label: '%',
                    });
                }
                else if (attr.type === 'bool' || attr.type === 'enum') {

                }
                else {
                    r.push({
                        value: '>',
                        label: '>',
                    });
                    r.push({
                        value: '<',
                        label: '<',
                    });
                }
            }
            return r;
        },

        /**
         * attrs
         * @param nObj
         */
        getAddForm: function(nObj) {
            let r = {};
            nObj.spec.attrs.forEach(a => {
                r[a.name] = a.default;
            });
            return r;
        },

        /**
         * attrs
         * @param nObj
         */
        getFormRules: function(nObj) {
            let r = {};
            if (Array.isArray(nObj.spec.keys)) {
                nObj.spec.keys.forEach(k => {
                    let attr = nObj.spec.attrs.find(a => a.name === k);
                    if (attr !== undefined) {
                        r[k] = [{required: true, message: '请输入'+attr.title, trigger: 'blur'}];
                    }
                });
            }
            nObj.spec.attrs.forEach(a => {
                if (a.required) {
                    r[a.name] = [{required: true, message: '请输入'+a.title, trigger: 'blur'}];
                }
            });
            return r;
        },

        getEditSubmitObj: function(nObj, formObj, oldObj) {
            let iCount = 0;
            let r = {};
            let key = nObj.spec.key ? nObj.spec.key.name : '';
            for (let prop in oldObj) {
                if (prop === key) {
                    continue;
                }
                let nv = formObj[prop];
                let ov = oldObj[prop];
                if (nv != ov) {
                    r[prop] = nv;
                    iCount++;
                }
            }
            if (iCount > 0) {
                return r;
            } else {
                return null;
            }
        }

    };
    odl.registerNPlugin(odl.UiVueTable);
})();
