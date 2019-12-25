
(function() {
    'use strict';

    if (typeof window === 'object') {
        window.gcl = window.gcl || {};
    }
    else if (typeof exports === 'object' && typeof global === 'object') {
        global.gcl = global.gcl || {};
    }
    else {
        throw Error('cjs only run at node.js or web browser');
    }
    let rtdb = gcl.rtdb || {};
    gcl.rtdb = rtdb;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = rtdb;
    }

    rtdb.clone = function(item) {
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

    let myDebug = function(...args) {
        console.log.apply(null, args);
    };

    let EnumMeasureType = {
        none: 0,
        monsb: 1,
        ycadd: 2,
        straw: 3,
    };
    rtdb.EnumMeasureType = EnumMeasureType;

    let getMeasureTypeById = function(measureId) {
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

    rtdb.startSyncMeasures = null;
    rtdb.stopSyncMeasures = null;

    let MeasureBase = function(...args) {
        let iId = 0;
        let sUrl = '';
        if (args.length > 0) {
            let arg0 = args[0];
            if (typeof arg0 === 'number') {
                iId = arg0;
                if (args.length > 1) {
                    let arg1 = args[1];
                    if (typeof arg0 === 'string') {
                        sUrl = arg1;
                    }
                }
            }
            else if (typeof arg0 === 'string') {
                sUrl = arg0;
                if (args.length > 1) {
                    let arg1 = args[1];
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

    MeasureBase.prototype.setValue = function(v) {
        myDebug('!!!error. setValue is abstract method!');
    };

    MeasureBase.prototype.setVQT = function(v, q, t) {
        this.setValue(v);
        if (q !== this.quality) {
            this.quality = q;
        }
        if (t !== this.changedTime) {
            this.changedTime = t;
        }
    };

    let MeasureManagerBase = function() {
        this.measures = new Map();
        this.MeasureClass = MeasureBase;
    };
    rtdb.MeasureManagerBase = MeasureManagerBase;

    MeasureManagerBase.prototype.findById = function(iId = 0) {
        let r = this.measures.get(iId);
        return r ? r : null;
    };

    MeasureManagerBase.prototype.findByUrl = function(sUrl = '') {
        for (let [k, v] of this.measures) {
            if (v.url === sUrl) {
                return v;
            }
        }
        return null;
    };

    MeasureManagerBase.prototype.append = function(measure) {
        if (measure) {
            let bId = (typeof measure.id === 'number' && measure.id > 0 && this.findById(measure.id) === null);
            if (bId) {
                let r = new this.MeasureClass(measure);
                this.measures.set(measure.id, r);
                return r;
            }
        }
        else {
            return null;
        }
    };

    MeasureManagerBase.prototype.appendById = function(iId) {
        if (typeof iId === 'number' && iId > 0 && this.findById(iId) === null) {
            let measure = new this.MeasureClass(iId);
            this.measures.set(measure.id, measure);
            return measure;
        }
        else {
            return null;
        }
    };

    MeasureManagerBase.prototype.remove = function(measure) {
        let r = 0;
        if (measure && typeof measure.id === 'number') {
            let bId = (typeof measure.id === 'number' && measure.id > 0);
            let bUrl = (typeof measure.url === 'string');
            if (bId) r = this.removeById(measure.id);
            if (bUrl) r += this.removeByUrl(measure.url);
        }
        return r;
    };

    MeasureManagerBase.prototype.removeById = function(iId) {
        return this.measures.delete(iId);
    };

    MeasureManagerBase.prototype.removeByUrl = function(sUrl) {
        let ks = [];
        for (let [k, v] of this.measures) {
            if (v.url === sUrl) {
                ks.push(k);
            }
        }
        let i = 0;
        for (let k of ks) {
            this.measures.delete(k);
            i++;
        }
        return i;
    };

    MeasureManagerBase.prototype.getReqMeasures = function() {
        let r = [];
        for (let [k, v] of this.measures) {
            r.push({
                mid: v.id,
                url: v.url,
            });
        }
        return r;
    };

    // # monsb
    let MonsbMeasure = function(...args) {
        MeasureBase.apply(this, args);
        this.value = -1;
    };
    MonsbMeasure.prototype = Object.create(MeasureBase.prototype);
    MonsbMeasure.prototype.constructor = MonsbMeasure;
    rtdb.MonsbMeasure = MonsbMeasure;

    MonsbMeasure.prototype.setValue = function(v) {
        let newValue = Number(v);
        if (newValue !== this.value) {
            this.value = newValue;
        }
    };

    let MonsbManager = function() {
        MeasureManagerBase.call(this);
        this.monsbs = this.measures;
        this.MeasureClass = MonsbMeasure;
    };
    MonsbManager.prototype = Object.create(MeasureManagerBase.prototype);
    MonsbManager.prototype.constructor = MonsbManager;
    rtdb.MonsbManager = MonsbManager;

    // # ycadd
    let YcaddMeasure = function(...args) {
        MeasureBase.apply(this, args);
        this.value = -1;
    };
    YcaddMeasure.prototype = Object.create(MeasureBase.prototype);
    YcaddMeasure.prototype.constructor = YcaddMeasure;
    rtdb.YcaddMeasure = YcaddMeasure;

    YcaddMeasure.prototype.setValue = function(v) {
        let newValue = Number(v);
        if (newValue !== this.value) {
            this.value = newValue;
        }
    };

    let YcaddManager = function() {
        MeasureManagerBase.call(this);
        this.ycadds = this.measures;
        this.MeasureClass = YcaddMeasure;
    };
    YcaddManager.prototype = Object.create(MeasureManagerBase.prototype);
    YcaddManager.prototype.constructor = YcaddManager;
    rtdb.YcaddManager = YcaddManager;

    // # straw
    let StrawMeasure = function(...args) {
        MeasureBase.apply(this, args);
        this.value = -1;
    };
    StrawMeasure.prototype = Object.create(MeasureBase.prototype);
    StrawMeasure.prototype.constructor = StrawMeasure;
    rtdb.StrawMeasure = StrawMeasure;

    StrawMeasure.prototype.setValue = function(v) {
        let newValue = String(v);
        if (newValue !== this.value) {
            this.value = newValue;
        }
    };

    let StrawManager = function() {
        MeasureManagerBase.call(this);
        this.straws = this.measures;
        this.MeasureClass = StrawMeasure;
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
    let findMeasureById = function(measureId) {
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

    let findMeasureByUrl = function(sUrl = '') {
        return monsbManager.findByUrl(sUrl)
            || ycaddManager.findByUrl(sUrl)
            || strawManager.findByUrl(sUrl);
    };
    rtdb.findMeasureByUrl = findMeasureByUrl;

    let appendMeasureById = function(measureId) {
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
        if (typeof rtdb.startSyncMeasures === 'function')
            rtdb.startSyncMeasures();
        return r;
    };
    rtdb.appendMeasureById = appendMeasureById;

    let removeMeasureById = function(measureId) {
        let iId = Number(measureId);
        let r = null;
        switch (getMeasureTypeById(iId)) {
            case EnumMeasureType.monsb:
                r = monsbManager.removeById(iId);
                break;
            case EnumMeasureType.ycadd:
                r = ycaddManager.removeById(iId);
                break;
            case EnumMeasureType.straw:
                r = strawManager.removeById(iId);
                break;
            default:
                break;
        }
        if (getMeasureCount() <= 0) {
            if (typeof rtdb.stopSyncMeasures === 'function')
                rtdb.stopSyncMeasures();
        }
        return r;
    };
    rtdb.removeMeasureById = removeMeasureById;

    let getMeasureCount = function() {
        return monsbManager.monsbs.size + ycaddManager.ycadds.size + strawManager.straws.size;
    };
    rtdb.getMeasureCount = getMeasureCount;

    rtdb.printAll = function() {
        console.log('monsbManager.monsbs {size:', monsbManager.monsbs.size,);
        console.log(monsbManager.monsbs);
        console.log('}');
        console.log('ycaddManager.ycadds {size:', ycaddManager.ycadds.size,);
        console.log(ycaddManager.ycadds);
        console.log('}');
        console.log('strawManager.straws {size:', strawManager.straws.size,);
        console.log(strawManager.straws);
        console.log('}');
    };

})(typeof window !== 'undefined' ? window : this);
