'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

require('./../../3rd/cjs-3/cjfs.js');

// require('./../../../assets/3rd/odl-3/odl');
// require('./../../../assets/3rd/odl-3/odl_n_mysql');
// require('./../../../assets/3rd/odl-3/odl_n_vue');
// require('./../../../assets/projects/default/odl/department');
// require('./../../../assets/projects/default/odl/role_group');
// require('./../../../assets/projects/default/odl/user');
// require('./../../../assets/projects/default/odl/material');
// require('./../../../assets/projects/default/odl/position');
// require('./../../../assets/projects/default/odl/reader');
// require('./../../../assets/projects/default/odl/status');
// require('./../../../assets/projects/default/odl/recording');
const odlLoader = require('./../../../projects/gcl3/master/odl-loader');

const mysqlOption = {
    connectionLimit: 10,
    // host: '10.32.50.57',
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'db1',
};

let dtNow = Date.now();

let argv = {};
let argKey = '';
let argValue = '';
process.argv.forEach(function(arg) {
    if (arg.startsWith('-')) {
        if (argKey) {
            argv[argKey] = argValue;
        }
        argKey = arg;
        argValue = '';
        return;
    }
    if (argValue.length > 0)
        argValue += ' ' + arg;
    else
        argValue = arg;
});
if (argKey) {
    argv[argKey] = argValue;
}
console.log(argv);

const savePath = process.argv['-p'] ? process.argv['-p'] : (os.platform() === 'win32' ? 'd:/tmp/odl' : '/tmp/odl');
if (!fs.existsSync(savePath)) {
    console.log(' --- savePath --- : ');
    console.log(savePath);
    cjs.CjFs.mkdirMultiLevelSync(savePath);
}

let mysql = require('mysql');
let pool = mysql.createPool(mysqlOption);

function execSql(sql) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log('error ' + String(i));
        }
        else {
            connection.query(sql, function(err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) exec");
            });
        }
    });
}

function querySql(sql) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log('error ' + String(i));
        }
        else {
            connection.query(sql, function(err, rows, fields) {
                if (err) throw err;
                console.log(rows.length + ' record(s) query');
                console.log(JSON.stringify(rows));
                console.log(JSON.stringify(fields));
            });
        }
    })
};

function querySqlPromise(sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    });
};

let countTestSql = 0;

function closePool() {
    if (countTestSql === 0) {
        pool.end();
    }
}

const departmentCount = 10;
const roleGroupCount = 20;
const defaultCount = 20;

/**
 * insertStrategies
 * insert strategy :
 *     index: from start to end
 *     random: scope in min 2 max
 * @type {{role_group: {count: number, attrs: Array}, department: {count: number, attrs: Array}, user: {count: number, attrs: *[]}}}
 */
let insertStrategies = {
    department: {
        count: departmentCount,
        attrs: []
    },
    role_group: {
        count: roleGroupCount,
        attrs: []
    },
    user: {
        count: 100,
        attrs: [
            {
                name: "name",
                // head: '20190730',
                // tail: '20190730'
            },
            {
                name: "height",
                start: 0,
                end: 300,
                seed: 'random'
            },
            {
                name: "departmentId",
                start: 0,
                end: departmentCount,
                seed: 'random'
            },
            {
                name: "roleGroupId",
                start: 0,
                end: roleGroupCount,
                seed: 'random'
            }
        ]
    },
    material: {
        count: defaultCount,
        attrs: [],
    },
    position: {
        count: defaultCount,
        attrs: [],
    },
    reader: {
        count: defaultCount,
        attrs: [],
    },
    status: {
        count: defaultCount,
        attrs: [],
    },
    recording: {
        count: defaultCount,
        attrs: [],
    },
};

let selectConditions = {
    department: {
        attrs: [
            {
                name: 'name',
                operation: '%',
                value: 'a',
                isAnd: false
            },
            {
                name: 'id',
                operation: '>',
                value: 1,
                isAnd: true
            }
        ]
    },
    role_group: {
        attrs: [
            {
                name: 'name',
                operation: '%',
                value: 'a',
                isAnd: false
            },
            {
                name: 'id',
                operation: '>',
                value: 3,
                isAnd: true
            }
        ]
    },
    user: {
        start: 0,
        end: 20,
        attrs: [
            {
                name: 'name',
                operation: '%',
                value: 'a',
                isAnd: false
            },
            {
                name: 'id',
                operation: '>',
                value: 15,
                isAnd: true
            }
        ]
    },

};

async function testSql(odc) {
    countTestSql++;
    let odcName = odc.metadata.name;
    let fp = path.resolve(savePath, odcName + ".json");
    fs.writeFileSync(fp, JSON.stringify(odc));
    console.log('fs.writeFileSync(fp), fp: ', fp);

    let sqlDrop = odl.DbMysql.getDropSql(odc);
    // execSql(sqlDrop);
    let values = await querySqlPromise(sqlDrop);
    console.log('sqlDrop: ', values);

    let sqlCreate = odl.DbMysql.getCreateSql(odc);
    fp = path.resolve(savePath, odcName + ".create.sql");
    fs.writeFileSync(fp, sqlCreate);
    console.log('fs.writeFileSync(fp), fp: ', fp);
    // execSql(sqlCreate);
    values = await querySqlPromise(sqlCreate);
    console.log('sqlCreate: ', values);

    let sqlCreateLog = odl.DbMysql.log.getCreateSql(odc);
    if (sqlCreateLog){
        fp = path.resolve(savePath, odcName + ".create-log.sql");
        fs.writeFileSync(fp, sqlCreateLog);
        console.log('fs.writeFileSync(fp), fp: ', fp);
        // execSql(sqlCreateLog);
        values = await querySqlPromise(sqlCreateLog);
        console.log('sqlCreateLog: ', values);
    }

    fp = path.resolve(savePath, odcName + ".insert.sql");
    let strategies = insertStrategies[odcName];
    if (strategies) {
        let sqlsInsert = odl.DbMysql.genRandomInsertSql(odc, strategies);
        fs.writeFileSync(fp, sqlsInsert.join('\n'));
        console.log('fs.writeFileSync(fp), fp: ', fp);
        for (let i = 0; i < sqlsInsert.length; i++) {
            let sql = sqlsInsert[i];
            // execSql(sql);
            values = await querySqlPromise(sql);
            console.log('sqlInsert: ', values, ' cost time: ', Date.now() - dtNow);
        }
    }

    let conditions = selectConditions[odcName];
    if (conditions) {
        let sqlSelect = odl.DbMysql.getSelectSql(odc, conditions);
        fp = path.resolve(savePath, odcName + ".select.sql");
        fs.writeFileSync(fp, sqlSelect);
        console.log('fs.writeFileSync(fp), fp: ', fp);
        // querySql(sqlSelect);
        values = await querySqlPromise(sqlSelect);
        console.log('sqlSelect: ', values);
    }

    let sqlSelectAll = odl.DbMysql.getSelectAllSql(odc);
    fp = path.resolve(savePath, odcName + ".select-all.sql");
    fs.writeFileSync(fp, sqlSelectAll);
    console.log('fs.writeFileSync(fp), fp: ', fp);
    // querySql(sqlSelectAll);
    values = await querySqlPromise(sqlSelectAll);
    console.log('sqlSelectAll: ', values);

    console.log(Date.now() - dtNow);

    countTestSql--;
    closePool();
}

async function testSqls() {
    odl.getOdcs().forEach(testSql);
}

testSqls();
