/* !
// ICS实时数据请求的 json格式：支持散列请求：rtdata_v101；数组请求是：rtdata_v102；返回时都统一用：rtdata_v001
// url 是全局统一资源名（可以通用在容器对象或实体对象中）
// mid 是实时库的实时点全局唯一id
// url和mid可以只有一个，两个同时都有时以mid为准
// ics.json 散列请求
http://10.31.0.15:8821/ics.cgi?fncode=req.rtdata_v101&filetype=json

fncode = req.rtdata_v101
filetype = json

{
  "session":"sbid=0001;xxx=adfadsf",
  "structtype": "rtdata_v101",
  "params":
  [
    {
    "url": "/fp/zyj/fgj01/rfid",
    "mid": 33556644
    },
    {
    "url": "/fp/zyj/fgj01/ypmm",
    "mid": 33556645
    }
  ]
}


// ics.json 数组请求
// 数组请求中是以url为索引时，如果url可以对应到mid就以mid为开始索引；如果url是容器时就返回容器对应数量内个数
fncode = req.rtdata_v102
filetype = json

{
  "session":"sbid=0001;xxx=adfadsf",
  "structtype": "rtdata_v102",
  "params":
  [
    {
    "url": "/fp/zyj/fgj01/rfid",
    "mid": 33556644,
    "count": 100
    },
    {
    "url": "/fp/zyj/fgj01/ypmm",
    "mid": 33556645,
    "count": 100
    }
  ]
}


// ics.json返回时都统一用：rtdata_v001
// "v": 数值
// "q": 值的质量
// "t": 值的时间,unix时间戳（1970到目前的毫秒数，服务器的当地时间）
// 可选属性"srcid": 实时数据信息来源的源ID,
// 可选属性"srcurl": 实时数据信息来源的源url,
// 可选属性"state":状态码，无或0时表示成功，其它值看具体数据字典
{
  "session":"sbid=0001;xxx=adfadsf",
  "structtype":"rtdata_v001",
  "data":[
    {
    "url":"/fp/zyj/fgj01/rfid",
    "mid":33556644,
    "v":"ABC12345678D",
    "q":1,
    "t":1892321321,
    "srcid":1231231,
    "srcurl":"/fp/zyj/fgjapp",
    "state":0
    },
    {
    "url":"/fp/zyj/fgj01/ypmm",
    "mid":33556645,
    "v":"20160100001",
    "q":1,
    "t":1892321521
    "srcid":1231231,
    "srcurl":"/fp/zyj/fgjapp",
    "state":0
    }
  ]


// 实时点的历史实时数据请求的 json格式：支持时间段请求：rtlog_v102；同一时间点各点的值请求：rtlog_v103；返回时都统一用：rtlog_v001
// url 是全局统一资源名（可以通用在容器对象或实体对象中）
// mid 是实时库的实时点全局唯一id
// urls 是 URL 的数组
// mids 是 mid 的数组
// url和mid可以只有一个，两个同时都有时以mid为准
// dtday 2018-06-19 2018年6月19日这一天
// dtdate 2018-06-19 12:11:10 2018年6月19日12点11分10秒，从这 dtday + dtdate开始的时长 dtlong （如果 dtlong 没有就一小时）
// dtlong 时长（秒数）
// interval 历史点间的间隔时长
// i mid
// v 数值
// q 值的质量
// t 值的时间,unix时间戳（1970到目前的毫秒数，服务器的当地时间）
// s 实时数据信息来源的源ID,ChangedSourceId
// u 实时数据信息来源的源url,ChangedSourceId
// r ChangedReasonId

// rtlog_v102
fncode = req.rtlog_v102
filetype = json
// http://10.31.0.15:8821/ics.cgi?fncode=req.rtlog_v102&filetype=json

{
  "session":"sbid=0001;xxx=adfadsf",
  "structtype": "rtlog_v102",
  "params":
  [
    {
    "measures": [{'id': mid, 'url':url}, {'id': mid, 'url':url}],
    "dtbegin": 31343242341,
    "dtend": 23413241234,
    "interval": 1000
    }
  ]
}


// ics.json返回时都统一用：rtlog_v001
// logtype 指 log 的结构类型
// logtype 为 1 时log为[[t, v, q, s, r],...]
// logtype 为 2 时log为[v,v,v...]
// log 日志内容
// 可选属性"state":状态码，无或0时表示成功，其它值看具体数据字典
{
  "session":"sbid=0001;xxx=adfadsf",
  "structtype":"rtlog_v001",
  "state":0,
  "logcount":0,
  "data":[
    {
    "measure": {'id': mid, 'url':url},
    "logtype": 2,
    "log": "#logfile.text",
    "state":0
    }
  ]
}

 */

(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.gcl = global.gcl || {};
    } else if (typeof window === 'object') {
        window.gcl = window.gcl || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }

    let rtdb = gcl.rtdb || {};

    let rtlog = gcl.rtlog || {};
    gcl.rtlog = rtlog;

    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = rtlog;
    }

    let myDebug = function(...args) {
        console.log.apply(null, args);
    };

    // # rtdb's sync data
    let getReqMeasuresJson = function() {
        return JSON.stringify({
            session: '',
            structtype: 'rtdata_v101',
            params: (((monsbManager.getReqMeasures()).concat(
                ycaddManager.getReqMeasures())).concat(
                strawManager.getReqMeasures())),
        });
    };
    rtdb.getReqMeasuresJson = getReqMeasuresJson;

    let retReqMeasuresJson = '';
    rtdb.retReqMeasuresJson = retReqMeasuresJson;

    let dealRespMeasures = function(response) {
        if (!response) return;
        let arr = JSON.parse(response);
        let measures = arr.data;
        for (let i = 0; i < measures.length; i++) {
            let measure = measures[i];
            let iId = measure.mid;
            let m = rtdb.findMeasureById(iId);
            if (m !== null) {
                m.setVQT(measure.v, measure.q, measure.t);
            }
        }
    };

    rtdb.setRtServer = function(server) {
        this.rtServer = server;
    };

    let reqMeasures = function() {
        let xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        let sTarget = rtdb.rtServer ? ['http://', rtdb.rtServer, '/xxx.rtdata'].join('') : '/xxx.rtdata';
        xmlhttp.open('post', sTarget, true);
        xmlhttp.setRequestHeader('POWERED-BY-AID', 'Approve');
        xmlhttp.setRequestHeader('Content-Type', 'json');
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                myDebug('接收：RespMeasures - ' + new Date() + ' ' + xmlhttp.response.length);
                dealRespMeasures(xmlhttp.responseText);
            }
        };
        let sReqMeasuresJson = getReqMeasuresJson();
        let r = xmlhttp.send(sReqMeasuresJson);
        myDebug('发送：ReqMeasures - ' + new Date() + ' ' + r);
    };
    rtdb.reqMeasures = reqMeasures;

    let startSyncMeasures = function() {
        if (rtdb.getMeasureCount() > 0 && ! rtdb.startSyncMeasuresTm) {
            rtdb.startSyncMeasuresTm = setInterval(reqMeasures, 1000);
        }
    };
    rtdb.startSyncMeasures = startSyncMeasures;

    let stopSyncMeasures = function() {
        if (rtdb.startSyncMeasuresTm) {
            clearInterval(rtdb.startSyncMeasuresTm);
            rtdb.startSyncMeasuresTm = undefined;
        }
    };
    rtdb.stopSyncMeasures = stopSyncMeasures;

    let reqMeasuresByUrl = function(urls, callback) {
        if (!Array.isArray(urls) || typeof callback !== 'function') return;
        let retReqMeasuresJson = JSON.stringify({
            session: '',
            structtype: 'rtdata_v101',
            params: urls.map(e => {
                return {url: e}
            }),
        });
        let nginxSvr = this.rtServer;
        let xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        let sTarget = nginxSvr ? ['http://', nginxSvr, '/xxx.rtdata'].join('') : '/xxx.rtdata';
        xmlhttp.open('post', sTarget, true);
        xmlhttp.setRequestHeader('POWERED-BY-AID', 'Approve');
        xmlhttp.setRequestHeader('Content-Type', 'json');
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                myDebug('接收：RespMeasures - ' + new Date() + ' ' + xmlhttp.response.length);
                callback(xmlhttp.responseText);
            }
        };
        xmlhttp.send(retReqMeasuresJson);
    };
    rtdb.reqMeasuresByUrl = reqMeasuresByUrl;

    /**
     * reqRtlogByPeriod 时间段方式的请求
     * @param {Array} measures [{url, mid},{url, mid}]
     * @param {Number} dtBegin
     * @param {Number} dtEnd
     * @param {Number} iInterval
     * @param {function} fnCallback(logCount, data, err)
     */
    let reqRtlogByPeriod = function(measures, dtBegin, dtEnd, iInterval, fnCallback) {
        let retReqMeasuresJson = JSON.stringify({
            session: Date.now().toString(),
            structtype: 'rtlog_v102',
            params: [
                {
                    'measures': measures,
                    'dtbegin': dtBegin,
                    'dtend': dtEnd,
                    'interval': iInterval,
                },
            ],
        });
        if (!retReqMeasuresJson) {
            console.log('!!! warnning: retReqMeasuresJson is empty!!!');
            return;
        }
        let xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        xmlhttp.open('post', '001.rtlog.cgi', true);
        xmlhttp.setRequestHeader('POWERED-BY-AID', 'Approve');
        xmlhttp.setRequestHeader('Content-Type', 'json');
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                myDebug('接收：RespMeasures - ' + new Date() + ' ' + xmlhttp.response.length);
                if (fnCallback) {
                    fnCallback(JSON.parse(xmlhttp.responseText), dtBegin, dtEnd, iInterval);
                }
            }
        };
        let r = xmlhttp.send(retReqMeasuresJson);
        myDebug('发送：ReqMeasures - ' + new Date() + ' ' + r);
    };
    rtdb.reqRtlogByPeriod = reqRtlogByPeriod;

    let registerReqHeartJumpCallback = function registerReqHeartJumpCallback(fnDataChangedCallback) {
        rtdb.reqHeartJumpCallback = fnDataChangedCallback;
    };
    rtdb.registerReqHeartJumpCallback = registerReqHeartJumpCallback;

    let dealRespHeartJump = function dealRespHeartJump(response) {
        let arr = JSON.parse(response);
        let resSession = arr.session;
        let resContent = arr.data;
        if (rtdb.reqHeartJumpCallback) {
            rtdb.reqHeartJumpCallback(resSession, resContent);
        }
    };

    let sentHeartJumpEach = function sentHeartJumpEach(session, sysInfo) {
        let reqRespRtdatas = function() {
            let retReqJson = JSON.stringify({
                session: session,
                structtype: 'sysInfo_v101',
                params: sysInfo,
            });
            if (!retReqJson) {
                console.log('!!! warnning: sentHeartJumpEach - retReqJson is empty!!!');
                return;
            }
            let xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            }
            else if (window.ActiveXObject) {
                xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
            }
            xmlhttp.open('post', '001.app.heartjump', true);
            xmlhttp.setRequestHeader('POWERED-BY-AID', 'Approve');
            xmlhttp.setRequestHeader('Content-Type', 'json');
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    myDebug('接收：reqHeartJumpCallback - ' + new Date() + ' ' + xmlhttp.response.length);
                    dealRespHeartJump(xmlhttp.responseText);
                }
            };
            let r = xmlhttp.send(retReqJson);
            myDebug('发送：ReqMeasures - ' + new Date() + ' ' + r);
        };

        reqRespRtdatas();
    };
    rtdb.sentHeartJumpEach = sentHeartJumpEach;

})(typeof window !== 'undefined' ? window : this);
