(function() {
    'use strict';

    let odl = (typeof exports === 'object' && typeof global === 'object') ? global.odl : window.odl;

    odl.DbMysql = {
        kind: 'db.mysql',

        attrs: {
            int: {
                fieldType: 'int'
            },
            int32: {
                fieldType: 'int'
            },
            int64: {
                fieldType: 'bigint'
            },
            double: {
                fieldType: 'double'
            },
            bool: {
                fieldType: 'int'
            },
            string: {
                fieldType: 'varchar(255)'
            },
            date: {
                fieldType: 'bigint'
            },
            enum: {
                fieldType: 'int'
            }
        },

        getSimilar: function(odc) {
            return odl.findNObj(odc, this.kind);
        },

        getSimilarByName: function(name) {
            let odc = odl.findOdc(name);
            return odc ? this.getSimilar(odc) : null;
        },

        completionAttr: function(attr) {
            // fieldName
            if (!attr.fieldName && attr.name) {
                attr.fieldName = attr.name;
            }
            let attrs = this.attrs;
            // fieldType
            if (!attr.fieldType && attr.type) {
                let fieldType = attrs[attr.type];
                console.assert(fieldType);
                attr.fieldType = fieldType;
            }
        },

        // fieldType !== type
        toM: function(odcName, values) {
            let odc = odl.findOdc(odcName);
            if (! odc) return;
            if (! Array.isArray(values)) return;
            let nObj = this.getSimilar(odc);
            if (! nObj) return;
            nObj.spec.attrs.forEach(attr => {
                if (attr.type === 'date') {
                    values.forEach(value => {
                        let v = value[attr.name];
                        if (typeof v === "number") {
                            value[attr.name] = new Date(v);
                        }
                    })
                } else if (attr.type === 'bool') {
                    values.forEach(value => {
                        let v = value[attr.name];
                        if (typeof v === "number") {
                            value[attr.name] = Boolean(v);
                        }
                    })
                }
            });
        },

        fromM: function(odcName, objs) {
            let odc = odl.findOdc(odcName);
            if (! odc) return;
            if (! Array.isArray(objs)) return;
            let nObj = this.getSimilar(odc);
            if (! nObj) return;
            nObj.spec.attrs.forEach(attr => {
                if (attr.type === 'date') {
                    objs.forEach(o => {
                        let v = o[attr.name];
                        if (v) {
                            o[attr.name] = v.valueOf();
                        } else {
                            o[attr.name] = undefined;
                        }
                    })
                } else if (attr.type === 'bool') {
                    objs.forEach(o => {
                        let v = o[attr.name];
                        if (typeof v === "boolean") {
                            o[attr.name] = Number(v);
                        } else {
                            o[attr.name] = undefined;
                        }
                    })
                } else if (attr.type === 'string') {
                    objs.forEach(o => {
                        let v = o[attr.name];
                        if (! v) {
                            o[attr.name] = undefined;
                        }
                    })
                } else {
                    objs.forEach(o => {
                        let v = o[attr.name];
                        if (typeof v !== 'number') {
                            o[attr.name] = undefined;
                        }
                    })
                }
            });
        },

        /**
         *
         * @param odc
         * @param nObj
         * @returns {Error|null}
         */
        normalize: function(odc, nObj) {
            if (nObj.kind !== this.kind) {
                return new Error('kind invalid!!');
            }
            // attrs
            let supperAttrs = odc.spec.attrs;
            if (!nObj.spec) nObj.spec = {};
            let spec = nObj.spec;
            if (!spec.attrs) spec.attrs = [];
            let attrs = spec.attrs;
            let newAttrs = odl.Attr.mergeAttrs(supperAttrs, attrs);
            for (let i = 0; i < newAttrs.length; i++) {
                let newAttr = newAttrs[i];
                this.completionAttr(newAttr);
            }
            // table
            if (!spec.table) spec.table = {};
            let table = spec.table;
            if (!table.name) table.name = odc.metadata.name;
            // table.keys & table.key
            if (Array.isArray(odc.spec.container.keys) && !table.keys) {
                table.keys = odl.clone(odc.spec.container.keys);
            }
            if (Array.isArray(odc.spec.container.sorts) && !table.sorts) {
                table.sorts = odl.clone(odc.spec.container.sorts);
            }
            if (Array.isArray(table.keys) && table.keys.length > 0) {
                let sKey = table.keys.find(ele => typeof ele === 'string' && ele.length > 0);
                table.key = newAttrs.find(ele => ele.name === sKey);
            }
            spec.table = table;
            spec.attrs = newAttrs;

            return null;
        },

        /**
         *
         * @param odc
         *
         CREATE TABLE `table3` (
         `f1` int NOT NULL,
         `f2` bigint DEFAULT NULL,
         `f3` double DEFAULT NULL,
         `f4` char(64) DEFAULT NULL,
         `f5` varchar(255) DEFAULT NULL,
         `f6` text,
         PRIMARY KEY (`f1`)
         )
         *
         */
        /**
         * @param odc
         * @returns {string}
         */
        getCreateSql: function(odc) {
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let sPrimaryKey = '';
                let keys = nObj.spec.table.keys;
                if (Array.isArray(keys)) {
                    let pks = keys.filter(x => typeof x === 'string');
                    sPrimaryKey = pks.map(x => '`' + x + '`').join(',');
                }
                let sql = ['CREATE TABLE IF NOT EXISTS `'];
                sql.push(nObj.spec.table.name);
                sql.push('` (');
                let attrs = nObj.spec.attrs;
                if (Array.isArray(attrs)) {
                    for (let i = 0; i < attrs.length; i++) {
                        let attr = attrs[i];
                        let fieldName = attr.fieldName;
                        let fieldType = attr.fieldType;
                        let sIsNull = attr.isNull ? 'DEFAULT NULL' : 'NOT NULL';
                        let sItem = '`' + fieldName + '` ' + fieldType.fieldType + ' ' + sIsNull;
                        if (i !== attrs.length - 1) {
                            sItem += ',';
                        }
                        else if (sPrimaryKey) {
                            sItem += ',';
                        }
                        sql.push(sItem);
                    }
                    if (sPrimaryKey) {
                        sql.push('PRIMARY KEY (' + sPrimaryKey + ')');
                    }
                    sql.push(')');
                    return sql.join('');
                }
            }
            return '';
        },

        /**
         *
         * @param odc
         * @returns {string}
         */
        getDropSql: function(odc) {
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let sql = ['DROP TABLE IF EXISTS `'];
                sql.push(nObj.spec.table.name);
                sql.push('`');
                return sql.join('');
            }
            return '';
        },

        getConditionsSql: function(odc, conditions) {
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let tableName = nObj.spec.table.name;
                let attrs = conditions.attrs;
                // where
                if (conditions) {
                    if (Array.isArray(attrs)) {
                        let where = [];
                        for (let i = 0; i < attrs.length; i++) {
                            let condition = attrs[i];
                            let attr = nObj.spec.attrs.find(a => a.name === condition.name);
                            if (attr) {
                                let sOpValue = String(condition.value);
                                let operation = condition.operation;
                                if (operation === '%') {
                                    sOpValue = "LIKE '%" + sOpValue + "%'";
                                }
                                else {
                                    if (attr.type === "string") {
                                        sOpValue = operation + " '" + sOpValue + "'";
                                    }
                                    else {
                                        sOpValue = operation + ' ' + sOpValue;
                                    }
                                }
                                let fieldName = attr.fieldName;
                                let sItem = ' `' + tableName + '`.`' + fieldName + '` ' + sOpValue;
                                if (i < attrs.length - 1) {
                                    sItem += condition.isAnd ? ' AND' : ' OR';
                                }
                                where.push(sItem);
                            }
                        }
                        return where.join('');
                    }
                }
            }
            return '';
        },

        /**
         *
         conditions : {
         start: 0,
         end: 20,
         attrs:[
         {
                name: "remark",
                operation: '%',
                value: value,
                isAnd: true
         }
         ] }
         *
         * @param odc
         * @param conditions
         * @returns {string}
         SELECT users.*, department.name as department_name, role_group.name as role_group_name
         FROM users
         LEFT JOIN department on users.departmentId = department.id
         LEFT JOIN role_group on users.roleGroupId = role_group.id
         WHERE users.id > 0 and users.name LIKE '%a%'
         */
        getSelectSql: function(odc, conditions) {
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let sqlSelect = 'SELECT ';
                let sqlFrom;
                let sqlLeftJion = '';
                let sqlWhere = '';
                let tableName = nObj.spec.table.name;
                // select as
                nObj.spec.attrs.forEach((a, i) => {
                    sqlSelect += tableName + '.`' + a.fieldName + '` as `' + a.name + '`';
                    if (i !== nObj.spec.attrs.length - 1) {
                        sqlSelect += ', '
                    }
                });
                // left join
                nObj.spec.attrs.forEach((a, i) => {
                    let refer = a.refer;
                    if (refer) {
                        // todo: refer key
                        // only suport : one refer , attrs and key is string
                        let rOdc = odl.findOdc(refer.odc);
                        if (rOdc) {
                            let rnObj = this.getSimilar(rOdc);
                            if (rnObj) {
                                sqlSelect += ", " + rnObj.spec.table.name + '.`' + refer.title
                                    + "` as " + refer.titleName;
                                sqlLeftJion += ' LEFT JOIN ' + rnObj.spec.table.name + ' ON ' + tableName
                                    + '.`' + a.fieldName + '` = ' + rnObj.spec.table.name + '.`' + refer.key + '`';
                            }
                        }
                    }
                });
                // from
                sqlFrom = ' FROM ' + tableName;
                // where
                if (conditions) {
                    let sConditionsSql = this.getConditionsSql(odc, conditions);
                    if (sConditionsSql.length > 0)
                        sqlWhere = ' WHERE ' + sConditionsSql;
                    if (typeof conditions.index === "number" && typeof conditions.count === "number") {
                        sqlWhere += ' LIMIT ' + conditions.index + ',' + conditions.count;
                    }
                }

                return sqlSelect + sqlFrom + sqlLeftJion + sqlWhere;
            }
            return '';
        },

        /**
         *
         * @param odc
         * @param conditions
         * @returns {string}
         */
        getSelectCountSql: function(odc, conditions) {
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let table = nObj.spec.table;
                let sqlSelect = 'SELECT ';
                let sqlFrom;
                let sqlWhere = '';
                let tableName = table.name;
                if (table.key) {
                    sqlSelect += 'COUNT(' + tableName + '.`' + table.key.fieldName + '`) as `counter`';
                }
                else {
                    sqlSelect += 'COUNT(*) as `counter`';
                }
                // from
                sqlFrom = ' FROM ' + tableName;
                // where
                if (conditions) {
                    let sConditionsSql = this.getConditionsSql(odc, conditions);
                    if (sConditionsSql.length > 0)
                        sqlWhere = ' WHERE ' + sConditionsSql;
                }
                return sqlSelect + sqlFrom + sqlWhere;
            }
            return '';
        },

        /**
         *
         * @param odc
         * @returns {string}
         */
        getSelectKeySql: function(odc) {
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let table = nObj.spec.table;
                let sqlSelect = 'SELECT ';
                let sqlFrom;
                let sqlWhere = '';
                let tableName = table.name;
                if (table.key && table.key.type !== 'string') {
                    sqlSelect += 'MAX(' + tableName + '.`' + table.key.fieldName + '`)+1 as `'+table.key.name+'`';
                    // from
                    sqlFrom = ' FROM ' + tableName;
                    return sqlSelect + sqlFrom;
                }
            }
            return '';
        },

        /**
         *
         * INSERT INTO `table1`(`f1`, `f2`, `f3`, `f4`, `f5`, `f6`)
         * VALUES (1, 1234567890123456789, 1.23, 'aa', 'aa1', 'abc-123');
         * @param odc
         * @param objs
         * @returns {[]|null}
         */
         getInsertSqlAry: function(odc, objs) {
            if (!Array.isArray(objs) || objs.length < 1) {
                return null;
            }
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let tableName = nObj.spec.table.name;
                if (! tableName) return null;
                let attrs = nObj.spec.attrs;
                if (attrs.length < 1) return null;
                let sqlAry = [];
                objs.forEach(o => {
                    let sql = [' INSERT INTO `', tableName, '`('].join('');
                    let sFields = [];
                    let sValues = [];
                    for (let prop in o) {
                        let attr = attrs.find(a => a.name === prop);
                        if (attr) {
                            sFields.push(['`', attr.fieldName, '`'].join(''))
                            if (attr.type === 'string') {
                                sValues.push("'" + o[prop] + "'");
                            }
                            else {
                                sValues.push(String(o[prop]));
                            }
                        }
                    }
                    sql += sFields.join(',');
                    sql += ') VALUES(';
                    sqlAry.push(sql + sValues.join(',') + ')');
                });
                return sqlAry;
            }
            return null;
        },

        /**
         *
         * UPDATE `table1` SET `f1` = 'v1', `f2` = 1537545552189 WHERE `id` = 5;
         * @param odc
         * @param obj
         * @param conditions
         * @returns {string|null}
         */
        getUpdateSql: function(odc, obj, conditions) {
            if (typeof obj !== 'object' || typeof conditions !== 'object') {
                return null;
            }
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let tableName = nObj.spec.table.name;
                if (! tableName) return null;
                let attrs = nObj.spec.attrs;
                if (attrs.length < 1) return null;
                let sql = [' UPDATE `', tableName, '`('].join('');
                let sFieldValues = [];
                for (let prop in obj) {
                    let attr = attrs.find(a => a.name === prop);
                    if (attr) {
                        if (attr.type === 'string') {
                            sFieldValues.push(['`', attr.fieldName, "` = '" + obj[prop] + "'"].join(''));
                        }
                        else {
                            sFieldValues.push(['`', attr.fieldName, '` = ', String(obj[prop])].join(''));
                        }
                    }
                }
                sql += sFieldValues.join(',');
                // where
                let sConditionsSql = this.getConditionsSql(odc, conditions);
                if (sConditionsSql.length > 0) {
                    sql += ' WHERE ' + sConditionsSql;
                    return sql;
                }
            }
            return null;
        },

        /**
         *
         * UPDATE `table1` SET `f1` = 'v1', `f2` = 1537545552189 WHERE `id` = 5;
         * @param odc
         * @param objs
         * @returns {[]|null}
         */
         getUpdateSqlAry: function(odc, objs, conditions) {
            if (!Array.isArray(objs) || !Array.isArray(conditions) || objs.length !== conditions.length) {
                return null;
            }
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let tableName = nObj.spec.table.name;
                if (! tableName) return null;
                let attrs = nObj.spec.attrs;
                if (attrs.length < 1) return null;
                let sqlAry = [];
                objs.forEach((obj, i) => {
                    let sql = [' UPDATE `', tableName, '` SET '].join('');
                    let sFieldValues = [];
                    for (let prop in obj) {
                        let attr = attrs.find(a => a.name === prop);
                        if (attr) {
                            if (attr.type === 'string') {
                                sFieldValues.push(['`', attr.fieldName, "` = '" + obj[prop] + "'"].join(''));
                            }
                            else {
                                sFieldValues.push(['`', attr.fieldName, '` = ', String(obj[prop])].join(''));
                            }
                        }
                    }
                    sql += sFieldValues.join(',');
                    // where
                    let condition = conditions[i];
                    let sConditionsSql = this.getConditionsSql(odc, condition);
                    if (sConditionsSql.length > 0) {
                        sql += ' WHERE ' + sConditionsSql;
                        sqlAry.push(sql);
                    }
                });
                return sqlAry;
            }
            return null;
        },

        /**
         *
         * DELETE FROM users WHERE users.`id`=1 OR users.`id`=2
         * @param odc
         * @param objs
         * @param conditions
         * @returns {null|[]}
         */
         getDeleteSqlAry: function(odc, conditions) {
            if (!Array.isArray(conditions) || conditions.length < 1) {
                return null;
            }
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let tableName = nObj.spec.table.name;
                if (! tableName) return null;
                let attrs = nObj.spec.attrs;
                if (attrs.length < 1) return null;
                let sqlAry = [];
                conditions.forEach((condition, i) => {
                    let sql = [' DELETE FROM `', tableName, '` '].join('');
                    // where
                    let sConditionsSql = this.getConditionsSql(odc, condition);
                    if (sConditionsSql.length > 0) {
                        sql += ' WHERE ' + sConditionsSql;
                        sqlAry.push(sql);
                    }
                });
                return sqlAry;
            }
            return null;
        },

        /**
         *
         * @param odc
         * @returns {string}
         */
        getSelectAllSql: function(odc) {
            let nObj = this.getSimilar(odc);
            if (nObj) {
                let sqlSelect = '';
                let sqlFrom;
                let tableName = nObj.spec.table.name;
                // select left join
                let attrs = nObj.spec.attrs;
                if (Array.isArray(attrs)) {
                    for (let i = 0; i < attrs.length; i++) {
                        let attr = attrs[i];
                        sqlSelect += tableName + '.`' + attr.fieldName + '`';
                        if (i !== attrs.length - 1) {
                            sqlSelect += ', '
                        }
                    }
                }
                sqlSelect = 'SELECT ' + sqlSelect;
                // from
                sqlFrom = ' FROM ' + tableName;
                return sqlSelect + sqlFrom;
            }
            return '';
        },

        /**
         *
         * INSERT INTO `table1`(`f1`, `f2`, `f3`, `f4`, `f5`, `f6`)
         * VALUES (1, 1234567890123456789, 1.23, 'aa', 'aa1', 'abc-123');
         *
         strategies : { count: 10000, attrs: [
         {
                name: "name",
                start: 0,
                end: 10000,
                seed: 'index' | 'time' | 'random'
                head: 'xxx',
                tail: 'xxx'
         }
         ] }
         *
         * @param odc
         * @param strategies
         * @returns {null|Array}
         */
        genRandomInsertSql: function(odc, strategies) {
            function generate(count) {
                let _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz- _1234567890';
                let str = '';
                for (let i = 0; i < count; i++) {
                    str += _sym[Math.floor(Math.random() * (_sym.length))];
                }
                return str;
            }

            let nObj = this.getSimilar(odc);
            if (nObj) {
                let iCount = strategies.count > 0 && strategies.count < 10000 ? strategies.count : 10000;
                let attrsST = Array.isArray(strategies.attrs) && strategies.attrs.length > 0 ? strategies.attrs : [];
                let attrs = nObj.spec.attrs;
                let valueses = [];
                for (let i = 0; i < attrs.length; i++) {
                    let attr = attrs[i];
                    let type = attr.type;
                    let attrST = attrsST.find(ele => ele.name === attr.name);
                    let minvalue = attrST && typeof attrST.start === 'number' ? attrST.start : attr.minvalue;
                    let maxvalue = attrST && typeof attrST.end === 'number' ? attrST.end : attr.maxvalue;
                    let maxLength = attr.maxLength > 255 ? 254 : attr.maxLength;
                    let dtNow = Date.now();
                    let values = [];
                    if (type === 'string') {
                        for (let j = 0; j < iCount; j++) {
                            let value = generate(Math.floor(Math.random() * maxLength));
                            if (value.length > 255) {
                                console.log('aa')
                            }
                            if (attrST && attrST.head) value = attrST.head + value;
                            if (attrST && attrST.tail) value = value + attrST.tail;
                            values.push(value);
                        }
                    }
                    else if (type === 'int') {
                        let start = attrST && typeof attrST.start === 'number' ? attrST.start : 0;
                        let end = attrST && typeof attrST.end === 'number' ? attrST.end : 0xFFFFFFFFFFFFF;
                        let index = start;
                        let seed = attrST && attrST.seed ? attrST.seed : 'index';
                        for (let j = 0; j < iCount; j++) {
                            if (seed === 'index') {
                                values.push(index++);
                                if (index > end) {
                                    index = start;
                                }
                            }
                            else if (seed === 'random') {
                                values.push(Math.round(Math.random() * (maxvalue - minvalue)) + minvalue);
                            }
                            else {
                                values.push(dtNow++);
                            }
                        }
                    }
                    else if (type === 'double') {
                        let start = attrST && typeof attrST.start === 'number' ? attrST.start : 0;
                        let end = attrST && typeof attrST.end === 'number' ? attrST.end : 0xFFFFFFFFFFFFF;
                        let index = start;
                        let seed = attrST && attrST.seed ? attrST.seed : 'index';
                        for (let j = 0; j < iCount; j++) {
                            if (seed === 'index') {
                                values.push(index++);
                                if (index > end) {
                                    index = start;
                                }
                            }
                            else if (seed === 'random') {
                                values.push(Math.random() * (end - start) + start);
                            }
                            else {
                                values.push(dtNow++ * Math.random());
                            }
                        }
                    }
                    else if (type === 'bool') {
                        for (let j = 0; j < iCount; j++) {
                            values.push(Math.round(Math.random()));
                        }
                    }
                    else if (type === 'date') {
                        for (let j = 0; j < iCount; j++) {
                            values.push(dtNow - Math.round(1000 * 60 * 60 * 24 * 365 * Math.random()));
                        }
                    }
                    else if (type === 'enum') {
                        let start = attrST && attrST.start ? attrST.start : 0;
                        let end = attrST && attrST.end ? attrST.end : attr.scopes.length;
                        let index = start;
                        let seed = attrST && attrST.seed ? attrST.seed : 'index';
                        for (let j = 0; j < iCount; j++) {
                            if (seed === 'random') {
                                values.push(Math.round(Math.random() * (end - start)) + start);
                            }
                            else {
                                values.push(index++);
                                if (index > end) {
                                    index = start;
                                }
                            }
                        }
                    }
                    valueses.push(values);
                }

                let sqls = [];
                for (let j = 0; j < iCount; j++) {
                    let sql = ['INSERT INTO `', nObj.spec.table.name, '`('].join('');
                    let attrs = nObj.spec.attrs;
                    if (!Array.isArray(attrs) || attrs.length < 0) {
                        return null;
                    }
                    let sFields = [];
                    for (let i = 0; i < attrs.length; i++) {
                        let attr = attrs[i];
                        let fieldName = attr.fieldName;
                        sFields.push(['`', fieldName, '`'].join(''))
                    }
                    sql += sFields.join(',');
                    sql += ') VALUES(';
                    let sValue = [];
                    for (let i = 0; i < attrs.length; i++) {
                        let attr = attrs[i];
                        let type = attr.type;
                        let values = valueses[i];
                        if (type === 'string') {
                            sValue.push("'" + values[j] + "'");
                        }
                        else {
                            sValue.push(String(values[j]));
                        }
                    }
                    sql += sValue.join(',') + ')';
                    sqls.push(sql);
                }
                return sqls;
            }
            return null;
        },

    };
    odl.registerNPlugin(odl.DbMysql);
})();
