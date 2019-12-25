/* !
 *
 */

(function () {
    let gcl = window.gcl;
    if (!gcl || !gcl.rtdb) return;
    let rtdb = gcl.rtdb;

    gcl.gis = gcl.gis || {};
    let gis = gcl.gis;

    if (gis.ind) return;

    let myDebug = gcl.debug || function () {
            console.log.apply(null, arguments);
        };

    const reUnit = /width|height|top|left|right|bottom|margin|padding/i;

    let setStyle = function (node, att, val, style) {
        style = style || node.style;

        if (style) {
            if (val === null || val === '') { // normalize unsetting
                val = '';
            }
            else if (!isNaN(Number(val)) && reUnit.test(att)) { // number values may need a unit
                val += 'px';
            }

            if (att === '') {
                att = 'cssText';
                val = '';
            }

            style[att] = val;
        }
    };

    let setStyles = function (el, hash) {
        function trim(str) {
            return str.replace(/^\s+|\s+$/g, '');
        }

        const styleObj = {};
        if (typeof hash === 'object') {
            Object.keys(hash).forEach(item => {
                setStyle(el, item, hash[item], styleObj);
            });
        }
        else if (typeof hash === 'string') {
            hash.split(';').forEach(item => {
                if (item.indexOf(':') !== -1) {
                    const obj = item.split(':');
                    setStyle(el, trim(obj[0]), trim(obj[1]), styleObj);
                }
            });
        }
        else {
            return;
        }
        const HAS_CSSTEXT_FEATURE = typeof (el.style.cssText) !== 'undefined';
        let originStyleText;
        const originStyleObj = {};
        if (!!HAS_CSSTEXT_FEATURE) {
            originStyleText = el.style.cssText;
        }
        else {
            originStyleText = el.getAttribute('style');
        }
        originStyleText.split(';').forEach(item => {
            if (item.indexOf(':') !== -1) {
                const obj = item.split(':');
                originStyleObj[trim(obj[0])] = trim(obj[1]);
            }
        });

        const mergedStyleObj = Object.assign({}, originStyleObj, styleObj);
        const styleText = Object.keys(mergedStyleObj)
            .map(item => item + ': ' + mergedStyleObj[item] + ';')
            .join(' ');

        if (!!HAS_CSSTEXT_FEATURE) {
            el.style.cssText = styleText;
        }
        else {
            el.setAttribute('style', styleText);
        }
    };

    let setAttrs = function (el, attrs) {
        function trim(str) {
            return str.replace(/^\s+|\s+$/g, '');
        }

        if (typeof attrs === 'string') {
            attrs.split(';').forEach(item => {
                if (item.indexOf(':') !== -1) {
                    const obj = item.split(':');
                    el.setAttribute(trim(obj[0]), trim(obj[1]));
                }
            });
        }
        else if (typeof attrs === 'object') {
            for (let key in attrs) {
                el.setAttribute(key, attrs[key]);
            }
        }
    };

    let setTextByMid = function (el, mid, nVqt) {
        switch (rtdb.getMeasureTypeById(mid)) {
            case rtdb.EnumMeasureType.monsb:
                el.textContent = nVqt.v.toFixed(0);
                break;
            case rtdb.EnumMeasureType.ycadd:
                el.textContent = nVqt.v.toFixed(2);
                break;
            case rtdb.EnumMeasureType.straw:
                el.textContent = String(nVqt.v);
                break;
            default:
                break;
        }
    };

    let _configs = [];

    let _kind = 'gcl.gis.ind';

    // [{name, conditions, pass}]
    let _strategies = [];

    // EQ 就是 EQUAL等于
    // NQ 就是 NOT EQUAL不等于
    // GT 就是 GREATER THAN大于　
    // LT 就是 LESS THAN小于
    // GE 就是 GREATER THAN OR EQUAL 大于等于
    // LE 就是 LESS THAN OR EQUAL 小于等于
    let createCondition = function (item) {
        // =
        let eq = (x) => {
            let v = Number(x);
            if (Number.isNaN(v)) v = x;
            return {
                v: v,
                check: function (nVqt) {
                    return nVqt.v === this.v
                },
            };
        };

        // !=
        let nq = (x) => {
            let v = Number(x);
            if (Number.isNaN(v)) v = x;
            return {
                v: v,
                check: function (nVqt) {
                    return nVqt.v !== this.v
                },
            };
        };

        // >
        let gt = (x) => {
            let v = x.length > 0 ? Number(x) : Number.NaN;
            if (Number.isNaN(v)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v: v,
                check: function (nVqt) {
                    return nVqt.v > this.v
                },
            };
        };

        // <
        let lt = (x) => {
            let v = x.length > 0 ? Number(x) : Number.NaN;
            if (Number.isNaN(v)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v: v,
                check: function (nVqt) {
                    return nVqt.v < this.v
                },
            };
        };

        // >=
        let ge = (x) => {
            let v = x.length > 0 ? Number(x) : Number.NaN;
            if (Number.isNaN(v)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v: v,
                check: function (nVqt) {
                    return nVqt.v >= this.v
                },
            };
        };

        // <=
        let le = (x) => {
            let v = x.length > 0 ? Number(x) : Number.NaN;
            if (Number.isNaN(v)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v: v,
                check: function (nVqt) {
                    return nVqt.v <= this.v
                },
            };
        };

        // x1 < v < x2 , (x1,x2)
        let gl = (x1, x2) => {
            let v1 = Number(x1);
            let v2 = Number(x2);
            if (Number.isNaN(v1) || Number.isNaN(v2)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v1: v1,
                v2: v2,
                check: function (nVqt) {
                    return nVqt.v > this.v1 && nVqt.v < this.v2;
                },
            };
        };

        // x1 < v <= x2 , (x1,x2]
        let gle = (x1, x2) => {
            let v1 = Number(x1);
            let v2 = Number(x2);
            if (Number.isNaN(v1) || Number.isNaN(v2)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v1: v1,
                v2: v2,
                check: function (nVqt) {
                    return nVqt.v > this.v1 && nVqt.v <= this.v2;
                },
            };
        };

        // x1 <= v <= x2 , [x1,x2]
        let gele = (x1, x2) => {
            let v1 = Number(x1);
            let v2 = Number(x2);
            if (Number.isNaN(v1) || Number.isNaN(v2)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v1: v1,
                v2: v2,
                check: function (nVqt) {
                    return nVqt.v >= this.v1 && nVqt.v <= this.v2;
                },
            };
        };

        // x1 <= v < x2 , [x1,x2)
        let gel = (x1, x2) => {
            let v1 = Number(x1);
            let v2 = Number(x2);
            if (Number.isNaN(v1) || Number.isNaN(v2)) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            return {
                v1: v1,
                v2: v2,
                check: function (nVqt) {
                    return nVqt.v >= this.v1 && nVqt.v < this.v2;
                },
            };
        };

        const re1 = /^\s*(!=|<=|>=|=|>|<)(.*)/
        const re2 = /^\s*([\[\(])(.*?)([\]\)])\s*$/;

        const s = String(item).trim();

        let m = s.match(re2);
        if (Array.isArray(m) && m.length >= 4) {
            let l = m[1];
            let r = m[3];
            let c = m[2].trim();
            let cs = s.split(',');
            if (cs.length < 2) {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
            let x1 = cs[0];
            let x2 = cs[1];
            // x1 < v < x2 , (x1,x2)
            // x1 < v <= x2 , (x1,x2]
            // x1 <= v <= x2 , [x1,x2]
            // x1 <= v < x2 , [x1,x2)
            if (l === '(' && r === ')') {
                // <
                if (x1.length < 1) {
                    return lt(x2);
                }
                else if (x2.length < 1) {
                    return gt(x1);
                }
                else {
                    return gl(x1, x2);
                }
            }
            else if (l === '[' && r === ']') {
                // <
                if (x1.length < 1) {
                    return le(x2);
                }
                else if (x2.length < 1) {
                    return ge(x1);
                }
                else {
                    return gele(x1, x2);
                }
            }
            else if (l === '[' && r === ')') {
                // <
                if (x1.length < 1) {
                    return lt(x2);
                }
                else if (x2.length < 1) {
                    return ge(x1);
                }
                else {
                    return gel(x1, x2);
                }
            }
            else if (l === '(' && r === ']') {
                // <
                if (x1.length < 1) {
                    return le(x2);
                }
                else if (x2.length < 1) {
                    return gt(x1);
                }
                else {
                    return gle(x1, x2);
                }
            }
            else {
                console.warn('createCondition fail! item: ', item);
                return null;
            }
        }
        else {
            m = s.match(re1);
            if (Array.isArray(m) && m.length >= 3) {
                let op = m[1];
                let x = m[2].trim();
                if (op === '>') {
                    return gt(x)
                }
                else if (op === '<') {
                    return lt(x)
                }
                else if (op === '!=') {
                    return nq(x)
                }
                else if (op === '>=') {
                    return ge(x)
                }
                else if (op === '<=') {
                    return le(x)
                }
                else if (op === '=') {
                    return eq(x)
                }
                else {
                    console.warn('createCondition fail! item: ', item);
                    return null;
                }

            }
            else {
                return eq(s);
            }
        }
    };

    // stat is config object
    let createStrategy = function (stat) {
        if (!Array.isArray(stat.strategies)) {
            return null;
        }
        let strategies = [];
        for (let i = 0; i < stat.strategies.length; i++) {
            let st = stat.strategies[i];
            let conds = [];
            st.conditions && st.conditions.forEach(item => {
                let cond = createCondition(item);
                if (cond) {
                    conds.push(cond);
                }
            });
            if (typeof st.condition === 'function') {
                conds.push({
                    check: st.condition,
                });
            }
            else if (typeof st.condition === 'number') {
                let cond = createCondition('=' + st.condition);
                if (cond) {
                    conds.push(cond);
                }
            }
            else if (typeof st.condition === 'string') {
                let cond = createCondition(st.condition);
                if (cond) {
                    conds.push(cond);
                }
            }
            if (conds.length === 0 && st.action) {
                conds.push({
                    check: function () {
                        return true;
                    },
                });
            }
            if (conds.length > 0) {
                strategies.push({
                    conditions: conds,
                    action: st.action,
                    check: function (nVqt) {
                        return this.conditions.some(cond => cond.check(nVqt));
                    },
                    done: function (ele, mid, nVqt) {
                        let action = this.action;
                        if (typeof action !== 'object') return;
                        if (action.hasOwnProperty('attr')) {
                            setAttrs(ele, action.attr);
                        }
                        if (action.hasOwnProperty('style')) {
                            setStyles(ele, action.style);
                        }
                        if (action.hasOwnProperty('text')) {
                            if (typeof action.text === 'boolean') {
                                ele.textContent = setTextByMid(ele, mid, nVqt);
                            }
                            else if (typeof action.text === 'function') {
                                action.text(ele, mid, nVqt);
                            }
                            else {
                                ele.textContent = String(action.text);
                            }
                        }
                    }
                })
            }
        }
        if (strategies.length > 0) {
            return {
                name: stat.name,
                _strategies: strategies,
                exec: function (ele, mid, nVqt) {
                    let strategies = this._strategies;
                    let bDone = false;
                    for (let i = 0; i < strategies.length; i++) {
                        let stat = strategies[i];
                        if (stat.check(nVqt)) {
                            stat.done(ele, mid, nVqt);
                            bDone = true;
                        }
                    }
                    if (!bDone) {
                        let execSt = getDefaultStrategy(mid);
                        if (execSt) {
                            execSt.exec(ele, mid, nVqt);
                        }
                    }
                }
            }
        }
        return null;
    };

    let findStrategy = function (name) {
        let sts = _strategies;
        for (let i = 0; i < sts.length; i++) {
            if (sts[i].name === name) {
                return sts[i];
            }
        }
        return null;
    };

    let createDefaultStrategy = function (mtype) {
        let name = null;
        let exec = null;
        switch (mtype) {
            case rtdb.EnumMeasureType.monsb:
                name = rtdb.EnumMeasureType.monsb;
                exec = (ele, mid, nVqt) => {
                    let iRemain = nVqt.v % 3;
                    if (iRemain === 2) {
                        setStyles(ele, 'fill-opacity:1;fill:#ff0000')
                        // ele.setAttribute('fill-opacity', '1');
                        // ele.setAttribute('fill', '#ff0000');
                    }
                    else if (iRemain === 1) {
                        setStyles(ele, 'fill-opacity:1;fill:#00ff00')
                        // ele.setAttribute('fill-opacity', '1');
                        // ele.setAttribute('fill', '#00ff00');
                    }
                    else if (iRemain === -1) {
                        setStyles(ele, 'fill-opacity:1;fill:#cccccc')
                        // ele.setAttribute('fill-opacity', '1');
                        // ele.setAttribute('fill', '#0000ff');
                    }
                    else {
                        setStyles(ele, 'fill-opacity:1;fill:#ffffff')
                    }
                };
                break;
            case rtdb.EnumMeasureType.ycadd:
                name = rtdb.EnumMeasureType.ycadd;
                exec = (ele, mid, nVqt) => {
                    ele.textContent = nVqt.v.toFixed(3);
                };
                break;
            case rtdb.EnumMeasureType.straw:
                name = rtdb.EnumMeasureType.straw;
                exec = (ele, mid, nVqt) => {
                    ele.textContent = String(nVqt.v);
                };
                break;
            default:
                return;
        }
        return {
            name: name,
            exec: exec
        };
    };

    let _monsbDefaultStrategy = createDefaultStrategy(rtdb.EnumMeasureType.monsb);
    let _ycaddDefaultStrategy = createDefaultStrategy(rtdb.EnumMeasureType.ycadd);
    let _strawDefaultStrategy = createDefaultStrategy(rtdb.EnumMeasureType.straw);

    let getDefaultStrategy = function (mid) {
        switch (rtdb.getMeasureTypeById(mid)) {
            case rtdb.EnumMeasureType.monsb:
                return _monsbDefaultStrategy;
            case rtdb.EnumMeasureType.ycadd:
                return _ycaddDefaultStrategy;
            case rtdb.EnumMeasureType.straw:
                return _strawDefaultStrategy;
            default:
                return null;
        }
    };

    let registerConfig = function (config) {
        if (config.kind !== _kind) {
            return new Error('config kind invalid!!');
        }
        config.spec.strategies && config.spec.strategies.forEach(stat => {
            let strategy = createStrategy(stat);
            strategy && _strategies.push(strategy);
        });
        _configs.push(config);
    };

    let findStrategyInConfig = function (mid, view) {
        // find in config.spec.views
        for (let i = _configs.length - 1; i >= 0; i--) {
            let config = _configs[i];
            let views = config.spec.views;
            if (Array.isArray(views)) {
                for (let j = 0; j < views.length; j++) {
                    let item = views[j];
                    let view2 = item.name;
                    let ms = item.measures;
                    if (Array.isArray(ms)) {
                        for (let k = 0; k < ms.length; k++) {
                            let m = ms[k];
                            if (m.mid === mid && view2 === view) {
                                let strategy = findStrategy(m.strategy);
                                if (strategy)
                                    return strategy;
                            }
                        }
                    }
                }
            }
        }
        // find in config.spec.inds
        for (let i = _configs.length - 1; i >= 0; i--) {
            let config = _configs[i];
            let inds = config.spec.inds;
            if (Array.isArray(inds)) {
                for (let j = 0; j < inds.length; j++) {
                    let d = inds[j];
                    if (!d.strategy) continue;
                    let bIn = false;
                    if (d.mid === mid) {
                        bIn = true;
                    }
                    let mids = d.mids;
                    if (!bIn && Array.isArray(mids)) {
                        for (let k = 0; k < mids.length; k++) {
                            let mid2 = mids[k];
                            if (typeof mid2 === 'number') {
                                if (mid2 === mid) {
                                    bIn = true;
                                    break;
                                }
                            }
                            else if (typeof mid2 === 'string') {
                                if (mid2.indexOf('~') !== -1) {
                                    const obj = mid2.split('~');
                                    let iStart = Number.parseInt(obj[0]);
                                    let iEnd = Number.parseInt(obj[1]);
                                    if (Number.isNaN(iStart) || Number.isNaN(iEnd)) {
                                        continue;
                                    }
                                    if (iStart > iEnd) {
                                        iStart = iEnd;
                                        iEnd = Number.parseInt(obj[0]);
                                    }
                                    if (mid >= iStart && mid <= iEnd) {
                                        bIn = true;
                                        break;
                                    }
                                }
                                else {
                                    if (mid === Number.parseInt(mid2)) {
                                        bIn = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (!bIn && d.url) {
                        let m = rtdb.findMeasureByUrl(d.url);
                        if (m && m.mid === mid) {
                            bIn = true;
                        }
                    }
                    let urls = d.urls;
                    if (!bIn && Array.isArray(urls)) {
                        for (let k = 0; k < urls.length; k++) {
                            let m = rtdb.findMeasureByUrl(urls[k]);
                            if (m && m.mid === mid) {
                                bIn = true;
                                break;
                            }
                        }
                    }
                    let midf = d.midf;
                    if (!bIn && typeof midf === 'function') {
                        bIn = midf(mid);
                    }
                    let urlf = d.urlf;
                    if (!bIn && typeof urlf === 'function') {
                        let m = rtdb.findMeasureByUrl(mid);
                        if (m) {
                            bIn = urlf(m.url);
                            break;
                        }
                    }
                    if (bIn) {
                        let strategy = findStrategy(d.strategy);
                        if (strategy)
                            return strategy;
                    }
                }
            }
        }
        return null;
    };

    // inds[mid] = {eis: [{view: 'main', ele: HTMLElement, strategy: {name: '', exec: Function}}], vqt: {v, q, t}}
    // ei : element interface
    let _inds = new Map();

    // todo: 目前用config中的 mid 创建ind，日后加入config中只有 url 时，要调用rtdb.reqMeasuresByUrl，等callback
    let _refreshTm = null;
    let startView = function (view) {
        let parentNode = view ? view : document;
        let viewName = view ? view.id : 'main';
        if (findIndByView(viewName)) {
            console.warn('startView fail! the view[', viewName, '] is active! please stop it, retry again!');
            return;
        }
        let svgMids = parentNode.querySelectorAll('[id^=\'m__\']');
        // let svgMids = $('text[id^=\'' + csRtdataUiPrefix + '\']');
        svgMids.forEach(ele => {
            let m = ele.id.match(/m__(.*)__m/);
            if (Array.isArray(m)) {
                let mid = Number.parseInt(m[1]);
                pushIndEI(viewName, ele, mid);
                rtdb.appendMeasureById(mid);
            }
        });
        if (!_refreshTm) {
            _refreshTm = setInterval(refresh, 1000);
        }
    };

    let findInd = function (mid) {
        return _inds.get(mid);
    };

    let findIndEI = function (view, ele) {
        for (let [k, v] of _inds) {
            let eis = v.eis;
            for (let i = 0; i < eis.length; i++) {
                let ei = eis[i];
                if (ei.view === view && ei.ele === ele) {
                    return ei;
                }
            }
        }
        return null;
    };

    let findIndByView = function (view) {
        for (let [k, v] of _inds) {
            let eis = v.eis;
            for (let i = 0; i < eis.length; i++) {
                let ei = eis[i];
                if (ei.view === view) {
                    return v;
                }
            }
        }
        return null;
    };

    let pushIndEI = function (view, ele, mid) {
        let ei = findIndEI(view, ele);
        if (ei) {
            console.warn('pushIndEI fail! the view[', view, '] is active! please stop it, retry again!');
            return;
        }
        let strategy = findStrategyInConfig(mid, view);
        if (strategy === null) {
            strategy = getDefaultStrategy(mid);
        }
        if (strategy === null) {
            return;
        }
        ei = {view: view, ele: ele, strategy: strategy};
        let d = _inds.get(mid);
        if (d) {
            if (!Array.isArray(d.eis)) d.eis = [];
            d.eis.push(ei);
        }
        else {
            _inds.set(mid, {eis: [ei]});
        }
    };

    let removeIndByView = function (view) {
        let delMids = [];
        for (let [k, v] of _inds) {
            let eis = v.eis;
            for (let i = eis.length - 1; i >= 0; i--) {
                let ei = eis[i];
                if (ei.view === view) {
                    eis.splice(i, 1);
                }
            }
            if (eis.length <= 0) {
                delMids.push(k);
            }
        }
        delMids.forEach(i => _inds.delete(i));
        return delMids;
    };

    let refresh = function () {
        let inds = _inds;
        let cmp = (mid, v1, v2) => {
            switch (rtdb.getMeasureTypeById(mid)) {
                case rtdb.EnumMeasureType.monsb:
                    return v1 === v2;
                case rtdb.EnumMeasureType.ycadd:
                    let v = v1 - v2;
                    return v < 0.009 && v > -0.009;
                default:
                    return v1 === v2;
            }
        };
        for (let [k, v] of inds) {
            let m = rtdb.findMeasureById(k);
            if (m !== null) {
                if (!v.vqt || !cmp(k, v.vqt.v, m.value)) {
                    let nVqt = {v: m.value, q: m.quality, t: m.changedTime};
                    let eis = v.eis;
                    for (let i = 0; i < eis.length; i++) {
                        let ei = eis[i];
                        ei.strategy.exec(ei.ele, k, nVqt);
                    }
                    v.vqt = nVqt;
                }
            }
        }
    };

    let printInds = function (level) {
        let lv = typeof level === 'number' ? level : 9;
        console.log('_inds: size: ', _inds.size);
        if (lv === 9) {
            console.log(_inds);
        }
        else if (lv === 8) {
            _inds.forEach((v, k, map) => {
                console.log(k, v.size);
            })
        }
    };

    let stopView = function (view) {
        let parentNode = view ? view : document;
        let viewName = view ? view.id : 'main';
        let delMids = removeIndByView(viewName);
        delMids.forEach(i => rtdb.removeMeasureById(i));
        if (_inds.size === 0) {
            if (_refreshTm) {
                clearInterval(_refreshTm);
                _refreshTm = null;
            }
        }
    };

    let __startRefresh = function () {
        let csRtdataUiPrefix = '_m_';

        let monsbManager = rtdb.monsbManager;
        let monsbs = monsbManager.monsbs;
        let ycaddManager = rtdb.ycaddManager;
        let ycadds = ycaddManager.ycadds;
        let strawManager = rtdb.strawManager;
        let straws = strawManager.straws;

        let svgMids = $("text[id^='" + csRtdataUiPrefix + "']");
        svgMids.each(function () {
            let name = this.id;
            let index = name.indexOf(csRtdataUiPrefix);
            if (index >= 0) {
                let sMid = name.substring(index + 12);
                let iId = Number(sMid);
                if (iId >= 0x01000000 && iId < 0x02000000) {
                    monsbManager.append(iId);
                }
                else if (iId >= 0x02000000 && iId < 0x03000000) {
                    ycaddManager.append(iId);
                }
                else if (iId >= 0x03000000 && iId < 0x04000000) {
                    strawManager.append(iId);
                }
            }
        });

        let showMeasuresTimeOut = function () {
            // * yx
            for (let i = 0; i < monsbs.length; i++) {
                let monsb = monsbs[i];
                let iMid = monsb.id;
                let sMid = string(iMid);
                let svgMeasure = d3.select("[id=" + csRtdataUiPrefix + sMid + "]");
                if (svgMeasure !== null) {
                    let iRemain = monsb.value % 3;
                    if (iRemain === 2)
                        svgMeasure.attr("fill", "#ff0000");
                    else if (iRemain === 1)
                        svgMeasure.attr("fill", "#00ff00");
                    else if (iRemain === -1)
                        svgMeasure.attr("fill", "#cccccc");
                    else
                        svgMeasure.attr("fill", "#ffff00");
                }
            }
            // * yc
            for (let i = 0; i < ycadds.length; i++) {
                let ycadd = ycadds[i];
                let iMid = ycadd.id;
                let sMid = string(iMid);
                let svgMeasure = d3.select("[id=" + csRtdataUiPrefix + sMid + "]");
                if (svgMeasure !== null) {
                    svgMeasure.text(sValue);
                }
            }
            // * yw
            for (let i = 0; i < straws.length; i++) {
                let straw = straws[i];
                let iMid = straw.id;
                let sMid = string(iMid);
                let svgMeasure = d3.select("[id=" + csRtdataUiPrefix + sMid + "]");
                if (svgMeasure !== null) {
                    svgMeasure.text(sValue);
                }
            }
        };

        setInterval(showMeasuresTimeOut, 1000);
    };

    gis.ind = gis.ind || {};
    let ind = gis.ind;
    ind.registerConfig = registerConfig;
    ind.startView = startView;
    ind.stopView = stopView;
    ind.printInds = printInds;

})(typeof window !== 'undefined' ? window : this);
