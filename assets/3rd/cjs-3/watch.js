'use strict';
define(['jquery', 'global', 'async', 'cjcommon', 'cjstorage', 'cjdatabaseaccess', 'cjajax', 'modal'], function($, g, async) {
    // let db = window.top.cjDb;
    // let serverInfo = JSON.parse(localStorage.getItem('server-config'));
    // let reqHost = serverInfo['server']['ipAddress'];
    // let reqPort = serverInfo['server']['httpPort'];
    // let reqParam = {
    //     reqHost: reqHost,
    //     reqPort: reqPort,
    // };
    // let sGetSignalSql = 'select F_PID as NeNo,F_URI as SignalUrl, F_NAME as SignalName, F_V as para from omc_user_subscribe where F_CLASS = ' + '\'' + 'RT_SILENCE' +'\'';
    // db.load(sGetSignalSql, function(err, val) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         for (let i = 0; i < val.length; i++) {
    //             cc4k.rtdb.appendMeasureByNenoCode(Number(val[i].NeNo), val[i].SignalUrl);
    //         }
    //         cc4k.rtdb.startSyncMeasures();
    //         cc4k.rtdb.registerMeasuresChangedCallback(function() {
    //             let aMeasure = [];
    //             let arr = [];
    //             let temp = 0;
    //             for (let i = 0; i < val.length; i++) {
    //                 aMeasure.push(cc4k.rtdb.findMeasureByNenoCode(Number(val[i].NeNo), val[i].SignalUrl));
    //             }
    //             for (let i = 0; i < val.length; i++) {
    //                 for (let j = 0; j < aMeasure.length; j++) {
    //                     if (val[i].SignalUrl === aMeasure[j].code && Number(val[i].NeNo) === Number(aMeasure[j].neno)) {
    //                         arr[temp] = {
    //                             code: aMeasure[j].code,
    //                             neNo: Number(aMeasure[j].neno),
    //                             para: val[i].para,
    //                             value: aMeasure[j].value,
    //                         };
    //                         temp++;
    //                         break;
    //                     }
    //                 }
    //             }
    //             let msg ='';
    //             for (let i = 0; i < arr.length; i++) {
    //                 let obj = JSON.parse(arr[i].para);
    //                 if (arr[i].value === -1) {
    //                     msg = msg + obj.msg;
    //                 }
    //             }
    //             let confirm= new modal.Modal(msg);
    //             confirm.confirmInit(test);
    //         });
    //     }
    // }, reqParam);


    let confirm= new modal.CreateModal('当前入厂车号与实际叫号不符,请检查！<br/>');
    setInterval(function() {
        let a = sessionStorage.getItem('s_user');
        if (a!=='admin') {
            confirm.confirmInit(test);
        }
    }, 1000);

    function test(flag) {
        console.log(flag);
        if (flag === 0) {
            confirm.confirmCancel();
        }
    }
});
