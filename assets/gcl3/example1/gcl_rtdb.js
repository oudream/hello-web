/*!
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

 */

(function () {

    window.gcl = window.gcl || {};
    window.gcl.rtdb = window.gcl.rtdb || {};

    let rtdb = window.gcl.rtdb;

    let myDebug = function () {
        console.log.apply(null, arguments);
    };

    let EnumMeasureType = {
        none: 0,
        monsb: 1,
        ycadd: 2,
        straw: 3
    };
    rtdb.EnumMeasureType = EnumMeasureType;

    let getMeasureTypeById = function getMeasureTypeById(measureId) {
        let iId = Number(measureId);
        if (iId >= 0x01000000 && iId < 0x02000000) {
            return EnumMeasureType.monsb;
        }
        else if (iId >= 0x02000000 && iId < 0x03000000) {
            return EnumMeasureType.ycadd;
        }
        else if (iId >= 0x03000000 && iId < 0x04000000) {
            return EnumMeasureType.straw;
        }
        else {
            return EnumMeasureType.none;
        }
    };
    rtdb.getMeasureTypeById = getMeasureTypeById;

    let MeasureBase = function MeasureBase() {
        let iId = 0;
        let sUrl = '';
        if (arguments.length > 0) {
            let arg0 = arguments[0];
            if (typeof arg0 === 'number') {
                iId = arg0;
                if (arguments.length > 1) {
                    let arg1 = arguments[1];
                    if (typeof arg0 === 'string') {
                        sUrl = arg1;
                    }
                }
            }
            else if (typeof arg0 === 'string') {
                sUrl = arg0;
                if (arguments.length > 1) {
                    let arg1 = arguments[1];
                    if (typeof arg0 === 'number') {
                        iId = arg1;
                    }
                }
            }
            else if (arg0 !== null && typeof value === 'object') {
                this.id = arg0.id ? arg0.id : iId;
                this.url = arg0.url ? arg0.url : sUrl;
                this.value = arg0.value ? arg0.value : null;
                this.quality = arg0.quality ? arg0.quality : 0;
                this.refreshTime = arg0.refreshTime ? arg0.refreshTime : Date();
                this.changedTime = arg0.changedTime ? arg0.changedTime : Date();
                this.refreshSourceId = arg0.refreshSourceId ? arg0.refreshSourceId : 0;
                this.changedSourceId = arg0.changedSourceId ? arg0.changedSourceId : 0;
                this.refreshReasonId = arg0.refreshReasonId ? arg0.refreshReasonId : 0;
                this.changedReasonId = arg0.changedReasonId ? arg0.changedReasonId : 0;
                this.equalStrategyId = arg0.equalStrategyId ? arg0.equalStrategyId : 0;
                this.res = arg0.res ? arg0.res : 0;
                return this;
                //     this.id               = arg0.id              ? arg0.id              : iId;
                //     this.url              = arg0.url             ? arg0.url             : sUrl;
                //     this.value            = arg0.value           ? arg0.value           : null;
                //     this.quality          = arg0.quality         ? arg0.quality         : 0;
                //     this.refreshTime      = arg0.refreshTime     ? arg0.refreshTime     : Date();
                //     this.changedTime      = arg0.changedTime     ? arg0.changedTime     : Date();
                //     this.refreshSourceId  = arg0.refreshSourceId ? arg0.refreshSourceId : 0;
                //     this.changedSourceId  = arg0.changedSourceId ? arg0.changedSourceId : 0;
                //     this.refreshReasonId  = arg0.refreshReasonId ? arg0.refreshReasonId : 0;
                //     this.changedReasonId  = arg0.changedReasonId ? arg0.changedReasonId : 0;
                //     this.equalStrategyId  = arg0.equalStrategyId ? arg0.equalStrategyId : 0;
                //     this.res              = arg0.res             ? arg0.res             : 0;
            }
        }
        this.id = iId;
        this.url = sUrl;
        this.value = null;
        this.quality = 0;
        this.refreshTime = Date();
        this.changedTime = Date();
        this.refreshSourceId = 0;
        this.changedSourceId = 0;
        this.refreshReasonId = 0;
        this.changedReasonId = 0;
        this.equalStrategyId = 0;
        this.res = 0;
    };
    rtdb.MeasureBase = MeasureBase;

    MeasureBase.prototype.setValue = function (v) {
        myDebug('!!!error. setValue is abstract method!');
    };

    MeasureBase.prototype.setVQT = function (v, q, t) {
        myDebug('!!!error. setValue is abstract method!');
    };

    let MeasureManagerBase = function () {
        this.measures = [];
        this.measureClass = MeasureBase;
    };
    rtdb.MeasureManagerBase = MeasureManagerBase;

    MeasureManagerBase.prototype.findById = function findById(iId = 0) {
        let measures = this.measures;
        for (let i = 0; i < measures.length; i++) {
            let measure = measures[i];
            if (measure.id === iId) {
                return measure;
            }
        }
        return null;
    };

    MeasureManagerBase.prototype.findByUrl = function findByUrl(sUrl = '') {
        let measures = this.measures;
        for (let i = 0; i < measures.length; i++) {
            let measure = measures[i];
            if (measure.url === sUrl) {
                return measure;
            }
        }
        return null;
    };

    MeasureManagerBase.prototype.append = function append(measure) {
        if (measure) {
            let bId = (typeof measure.id === 'number' && measure.id > 0 && this.findById(measure.id) === null);
            let bUrl = (typeof measure.url === 'string' && this.findByUrl(measure.url) === null);
            if (bId || bUrl) {
                let measure = new this.measureClass(measure);
                this.measures.push(measure);
                return measure;
            }
        }
        else {
            return null;
        }
    };

    MeasureManagerBase.prototype.appendById = function appendById(iId) {
        if (typeof iId === 'number' && iId > 0 && this.findById(iId) === null) {
            let measure = new this.measureClass(iId);
            this.measures.push(measure);
            return measure;
        }
        else {
            return null;
        }
    };

    MeasureManagerBase.prototype.appendByUrl = function appendByUrl(sUrl) {
        if (typeof sUrl === 'string' && this.findByUrl(sUrl) === null) {
            let measure = new this.measureClass(sUrl);
            this.measures.push(measure);
            return measure;
        }
        else {
            return null;
        }
    };

    MeasureManagerBase.prototype.remove = function remove(measure) {
        let r = 0;
        if (measure) {
            let bId = (typeof measure.id === 'number' && measure.id > 0);
            let bUrl = (typeof measure.url === 'string');
            if (bId) r = this.removeById(measure.id);
            if (bUrl) r += this.removeByUrl(measure.url);
        }
        return r;
    };

    MeasureManagerBase.prototype.removeById = function removeById(iId) {
        let r = 0;
        if (typeof iId === 'number') {
            let measures = this.measures;
            for (let i = measures.length - 1; i >= 0; i--) {
                let measure = measures[i];
                if (measure.id === iId) {
                    measures.splice(i, 1);
                    r++;
                }
            }
        }
        return r;
    };

    MeasureManagerBase.prototype.removeByUrl = function removeByUrl(sUrl) {
        let r = 0;
        if (typeof sUrl === 'string') {
            let measures = this.measures;
            for (let i = measures.length - 1; i >= 0; i--) {
                let measure = measures[i];
                if (measure.url === sUrl) {
                    measures.splice(i, 1);
                    r++;
                }
            }
        }
        return r;
    };

    MeasureManagerBase.prototype.getReqMeasures = function getReqMeasures() {
        let r = [];
        let measures = this.measures;
        for (let i = 0; i < measures.length; i++) {
            let measure = measures[i];
            let reqMeasure = {
                mid: measure.id,
                url: measure.url
            };
            r.push(reqMeasure);
        }
        return r;
    };

    // # monsb
    let MonsbMeasure = function MonsbMeasure() {
        MeasureBase.apply(this, arguments);
        this.value = -1;
    };
    MonsbMeasure.prototype = Object.create(MeasureBase.prototype);
    MonsbMeasure.prototype.constructor = MonsbMeasure;
    rtdb.MonsbMeasure = MonsbMeasure;

    MonsbMeasure.prototype.setValue = function (v) {
        let newValue = Number(v);
        if (newValue !== this.value) {
            this.value = newValue;
        }
    };

    MonsbMeasure.prototype.setVQT = function (v, q, t) {
        this.setValue(v);
        if (q !== this.quality) {
            this.quality = q;
        }
        if (t !== this.changedTime) {
            this.changedTime = t;
        }
    };

    let MonsbManager = function MonsbManager() {
        MeasureManagerBase.call(this);
        this.monsbs = this.measures;
        this.measureClass = MonsbMeasure;
    };
    MonsbManager.prototype = Object.create(MeasureManagerBase.prototype);
    MonsbManager.prototype.constructor = MonsbManager;
    rtdb.MonsbManager = MonsbManager;

    // # ycadd
    let YcaddMeasure = function YcaddMeasure() {
        MeasureBase.apply(this, arguments);
        this.value = -1;
    };
    YcaddMeasure.prototype = Object.create(MeasureBase.prototype);
    YcaddMeasure.prototype.constructor = YcaddMeasure;
    rtdb.YcaddMeasure = YcaddMeasure;

    YcaddMeasure.prototype.setValue = function (v) {
        let newValue = Number(v);
        if (newValue !== this.value) {
            this.value = newValue;
        }
    };

    YcaddMeasure.prototype.setVQT = function (v, q, t) {
        this.setValue(v);
        if (q !== this.quality) {
            this.quality = q;
        }
        if (t !== this.changedTime) {
            this.changedTime = t;
        }
    };

    let YcaddManager = function YcaddManager() {
        MeasureManagerBase.call(this);
        this.ycadds = this.measures;
        this.measureClass = YcaddMeasure;
    };
    YcaddManager.prototype = Object.create(MeasureManagerBase.prototype);
    YcaddManager.prototype.constructor = YcaddManager;
    rtdb.YcaddManager = YcaddManager;

    // # straw
    let StrawMeasure = function StrawMeasure() {
        MeasureBase.apply(this, arguments);
        this.value = -1;
    };
    StrawMeasure.prototype = Object.create(MeasureBase.prototype);
    StrawMeasure.prototype.constructor = StrawMeasure;
    rtdb.StrawMeasure = StrawMeasure;

    StrawMeasure.prototype.setValue = function (v) {
        let newValue = String(v);
        if (newValue !== this.value) {
            this.value = newValue;
        }
    };

    YcaddMeasure.prototype.setVQT = function (v, q, t) {
        this.setValue(v);
        if (q !== this.quality) {
            this.quality = q;
        }
        if (t !== this.changedTime) {
            this.changedTime = t;
        }
    };

    let StrawManager = function StrawManager() {
        MeasureManagerBase.call(this);
        this.straws = this.measures;
        this.measureClass = StrawMeasure;
    };
    StrawManager.prototype = Object.create(MeasureManagerBase.prototype);
    StrawManager.prototype.constructor = StrawManager;
    rtdb.StrawManager = StrawManager;

    // # rtdb's container
    let monsbManager = new MonsbManager();
    rtdb.monsbManager = monsbManager;
    let ycaddManager = new YcaddManager();
    rtdb.ycaddManager = ycaddManager;
    let strawManager = new StrawManager();
    rtdb.strawManager = strawManager;

    // # rtdb's generic find - append
    let findMeasureById = function findMeasureById(measureId) {
        let iId = Number(measureId);
        let r = null;
        switch (getMeasureTypeById(iId)) {
            case EnumMeasureType.monsb:
                r = monsbManager.findById(iId);
                break;
            case EnumMeasureType.ycadd:
                r = ycaddManager.findById(iId);
                break;
            case EnumMeasureType.straw:
                r = strawManager.findById(iId);
                break;
            default:
                break;
        }
        return r;
    };
    rtdb.findMeasureById = findMeasureById;

    let findMeasureByUrl = function findMeasureByUrl(sUrl = '') {
        return monsbManager.findByUrl(sUrl)
            || ycaddManager.findByUrl(sUrl)
            || strawManager.findByUrl(sUrl);
    };
    rtdb.findMeasureByUrl = findMeasureByUrl;

    let appendMeasureById = function (measureId) {
        let iId = Number(measureId);
        let r = null;
        switch (getMeasureTypeById(iId)) {
            case EnumMeasureType.monsb:
                r = monsbManager.appendById(iId);
                break;
            case EnumMeasureType.ycadd:
                r = ycaddManager.appendById(iId);
                break;
            case EnumMeasureType.straw:
                r = strawManager.appendById(iId);
                break;
            default:
                break;
        }
        return r;
    };
    rtdb.appendMeasureById = appendMeasureById;

    // # rtdb's sync data
    let getReqMeasuresJson = function getReqMeasuresJson() {
        return JSON.stringify({
            session: '',
            structtype: 'rtdata_v101',
            params: (((monsbManager.getReqMeasures()).concat(ycaddManager.getReqMeasures())).concat(strawManager.getReqMeasures()))
        });
    };
    rtdb.getReqMeasuresJson = getReqMeasuresJson;

    let retReqMeasuresJson = '';
    rtdb.retReqMeasuresJson = retReqMeasuresJson;

    let dealRespMeasures = function (response) {
        let arr = JSON.parse(response);
        let measures = arr.data;
        for (let i = 0; i < measures.length; i++) {
            let measure = measures[i];
            let iId = measure.mid;
            let myMeasure = rtdb.findMeasureById(iId);
            if (myMeasure !== null) {
                myMeasure.setVQT(measure.v, measure.q, measure.t);
            }
        }
    };

    let startSyncMeasures = function () {
        retReqMeasuresJson = getReqMeasuresJson();
        let req_resp_rtdatas = function () {
            let xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            }
            else if (window.ActiveXObject) {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.open("post", "xxx.rtdata", true);
            xmlhttp.setRequestHeader("POWERED-BY-AID", "Approve");
            xmlhttp.setRequestHeader('Content-Type', 'json');
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    myDebug('接收：RespMeasures - ' + Date() + ' ' + xmlhttp.response.length);
                    dealRespMeasures(xmlhttp.responseText)
                }
            };
            retReqMeasuresJson = getReqMeasuresJson();
            let r = xmlhttp.send(retReqMeasuresJson);
            myDebug('发送：ReqMeasures - ' + Date() + ' ' + r);
        };

        if (retReqMeasuresJson.length > 0) {
            setInterval(req_resp_rtdatas, 1000);
            return true;
        }
        else {
            console.log('!!! warnning: retReqMeasuresJson is empty!!!')
            return false;
        }
    };
    rtdb.startSyncMeasures = startSyncMeasures;
})(typeof window !== "undefined" ? window : this);
