(function() {
    'use strict';

    window.gis_bus = window.gis_bus || {};
<<<<<<< HEAD
    let bus = window.gis_bus;

    let neNo = [];
    let signal = [];
    let scheme = {};
    let pretreatment = {};

    $.getJSON('/hello/cc4k/gis_bus.json', function(data) {
        for (let d in data) {
            switch (d) {
                case 'neno':
                    neNo = data.neno;
                    break;
                case 'scheme':
                    scheme = data.scheme;
                    break;
                case 'pretreatment':
                    pretreatment = data.pretreatment;
                    break;
                case 'signal':
                    signal = data.signal;
                    break;
            }
        }
    });

    /**
     *
     * @param obj : { "id":"t-badge1","scheme":"txt_01" }
     * @param item : { code: data[j].signalUrl, value: aMeasure[i].value, refreshTime: aMeasure[i].refreshTime, res: aMeasure[i].res, ui_scheme: data[j].ui_scheme, }
     * @param cfg : "color_01":{ "desc":"颜色变化", "conditions":[ { "condition":"=", "value":0, "action":{ "attr":"fill:red" } }, { "condition":"=", "value":1, "action":{ "attr":"fill:white" } } ] }
     */
=======

    let neNo = [];
    let scheme = {};
    let pretreatment = {};
    let oAction = {
        init: function() {
            // let serverInfo = cacheOpt.get('server-config');
            // dbConnectInit(serverInfo);
            getJsonData();
        },
    };

    function getJsonData() {
        $.getJSON('/gis_bus.json', function(data) {
            for (let d in data) {
                switch (d) {
                    case 'neno':
                        neNo = data.neno;
                        break;
                    case 'scheme':
                        scheme = data.scheme;
                        break;
                    case 'pretreatment':
                        pretreatment = data.pretreatment;
                        break;
                    case 'signal':
                        getSignal(data.signal);
                        break;
                }
            }
        });
    }

    async function getSignal(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].signalUrl) {
                cc4k.rtdb.appendMeasureByNenoCode(Number(neNo[data[i].neNo]), data[i].signalUrl);
            } else {
                let arr = [];
                arr[0] = {
                    value: 0,
                    ui_scheme: data[i].ui_scheme,
                };
                emitData(arr);
            }
        }
        cc4k.rtdb.startSyncMeasures();
        cc4k.rtdb.registerMeasuresChangedCallback(function() {
            let aMeasure = [];
            let allRt = [];
            for (let i = 0; i < data.length; i++) {
                aMeasure.push(cc4k.rtdb.findMeasureByNenoCode(Number(neNo[data[i].neNo]), data[i].signalUrl));
            }
            let arr = [];
            let temp = 0;
            for (let i = 0; i < aMeasure.length; i++) {
                allRt[i] = {
                            code: aMeasure[i].code,
                            value: aMeasure[i].value,
                        };
                for (let j = 0; j < data.length; j++) {
                    if (!aMeasure[i]) {
                        break;
                    } else {
                        if (aMeasure[i].code === data[j].signalUrl) {
                            arr[temp] = {
                                code: data[j].signalUrl,
                                value: aMeasure[i].value,
                                refreshTime: aMeasure[i].refreshTime,
                                res: aMeasure[i].res,
                                ui_scheme: data[j].ui_scheme,
                            };
                            temp ++;
                        }
                    }
                }
            }
            emitData(arr);
            window.rtData = allRt;
        });
    }

    function emitData(data) {
        data.forEach((item) => {
            if (Number(item.value) !== -1) {
                item.ui_scheme.forEach((cfg) => {
                    if (cfg.scheme) {
                        if (scheme[cfg.scheme]) {
                            dealUiScheme(cfg, item, scheme[cfg.scheme]);
                        } else {
                            return -1;
                        }
                    } else {
                        dealUiScheme(cfg, item, cfg);
                    }
                });
            }
        });
    }

>>>>>>> 9f77014e06f9080ecddc8cd20e015127fb73fac0
    function dealUiScheme(obj, item, cfg) {
        let svgMeasure;
        svgMeasure = $(`#${obj.id}`);
        let dealData = null;
        if (obj.pretreatment) {
            let arrs = obj.pretreatment.split('?');
<<<<<<< HEAD
            if (arrs.length > 0 && pretreatment[arrs[0]]) {
                let para;
                if (arrs.length > 1) {
=======
            if (pretreatment[arrs[0]]) {
                let para;
                if (arrs[1]) {
>>>>>>> 9f77014e06f9080ecddc8cd20e015127fb73fac0
                    para= arrs[1].split(',');
                } else {
                    para = pretreatment[arrs[0]].para;
                }
                switch (pretreatment[arrs[0]].name) {
                    case 'remainder':
                        dealData = remainder(Number(item.value), para.join());
                        break;
                    case 'linearTrans_1':
                        dealData = linearTrans_1(Number(item.value), para.join());
                        break;
                    default:
                        break;
                }
            }
        }
        if (dealData === null) dealData = item.value;

        let bFinish = false;

        if (cfg.text) {
            if (typeof(dealData) === 'string' ) {
                let index = getCodeSpaIndex(dealData);
                svgMeasure.text(dealData.substring(0, index));
            } else {
                if (typeof(cfg.text) === 'boolean') {
                    svgMeasure.text(dealData);
                } else {
                    svgMeasure.text(cfg.text);
                }
            }
        }

        if (cfg.conditions) {
            for (let i = 0; i < cfg.conditions.length; i++) {
                if (cfg.conditions[i].condition) {
                    switch (cfg.conditions[i].condition) {
                        case '=':
                            if (Number(dealData) === cfg.conditions[i].value) {
                                setSvgAttr(svgMeasure, cfg.conditions[i].action, item);
                                bFinish = true;
                            }
                            break;
                        case '>':
                            if (Number(dealData) > cfg.conditions[i].value) {
                                setSvgAttr(svgMeasure, cfg.conditions[i].action, item);
                                bFinish = true;
                            }
                            break;
                        case '>=':
                            if (Number(dealData) >= cfg.conditions[i].value) {
                                setSvgAttr(svgMeasure, cfg.conditions[i].action, item);
                                bFinish = true;
                            }
                            break;
                        case '<':
                            if (Number(dealData) < cfg.conditions[i].value) {
                                setSvgAttr(svgMeasure, cfg.conditions[i].action, item);
                                bFinish = true;
                            }
                            break;
                        case '<=':
                            if (Number(dealData) < cfg.conditions[i].value) {
                                setSvgAttr(svgMeasure, cfg.conditions[i].action, item);
                                bFinish = true;
                            }
                            break;
                        default:
                            setSvgAttr(svgMeasure, cfg.conditions[i].action, item);
                            bFinish = true;
                            break;
                    }
                }
                if(bFinish === true) break;
            }
        }
    }

    function setSvgAttr(svg, attr, obj) {
        if (attr.hasOwnProperty('attr')) {
            let attrs = attr.attr.split(';');
            attrs.forEach((item) => {
                let arr = item.split(':');
                if (arr[0] === 'fillRandom') {
                    let a = '#' + (Date.now() % 0xffffff).toString(16);
                    svg.attr('fill', a);
                } else {
                    svg.attr($.trim(arr[0]), arr[1]);
                }
            });
        }
        if (attr.hasOwnProperty('text')) {
            svg.text(attr.text);
        }
        if (attr.hasOwnProperty('style')) {
            svg.css(attr.style);
        }
<<<<<<< HEAD
=======
        if (attr.hasOwnProperty('next') || attr.hasOwnProperty('method')) {
            if (attr.immediatelyExe) {
                if (attr.hasOwnProperty('method')) {
                    attr.method['code'] = obj.neNo;
                    attr.method['url'] = obj.signalUrl;
                    action.register(attr.method);
                }
                if (attr.hasOwnProperty('next')) {
                    window.location = attr.next;
                }
            } else {
                svg.on('click', function() {
                    if (attr.hasOwnProperty('method')) {
                        attr.method['code'] = obj.neNo;
                        attr.method['url'] = obj.signalUrl;
                        action.register(attr.method);
                    }
                    if (attr.hasOwnProperty('next')) {
                        window.location = attr.next;
                    }
                });
            }
        }
>>>>>>> 9f77014e06f9080ecddc8cd20e015127fb73fac0
    }

    function getCodeSpaIndex(data) {
        for (let i = 0; i < data.length; i ++) {
            if (data.charCodeAt(i) === 0) {
                return i;
            }
        }
    }

    function remainder() {
        if (arguments.length === 2) {
            if (arguments[1] === 0) {
                return arguments[0];
            } else {
                return arguments[0] % arguments[1];
            }
        } else {
            return 0;
        }
    }

    function linearTrans_1() {
        let data = arguments[0] * arguments[1] + arguments[2];
        if (arguments.length === 4) {
            let digit = arguments[4];
            return data.toFixed(digit);
        } else {
            return data.toFixed(2);
        }
    }

<<<<<<< HEAD
    bus.refreshMeasuresSvg = function refreshMeasuresSvg(measure) {
        signal.forEach(function (sig) {
            if (sig.signalUrl === measure.code) {
                if (sig.ui_scheme && sig.ui_scheme.length > 0) {
                    sig.ui_scheme.forEach(function (uis) {
                        if (uis.scheme) {
                            if (scheme[uis.scheme]) {
                                dealUiScheme(uis, measure, scheme[uis.scheme]);
                            } else {
                                return -1;
                            }
                        } else {
                            dealUiScheme(uis, measure, uis);
                        }
                    })
                }
            }
        });
    }

=======
    /**
     * 模块返回调用接口
     */
    return {
        beforeOnload: function() {
        },
        onload: function() {
            oAction.init();
        },
    };
>>>>>>> 9f77014e06f9080ecddc8cd20e015127fb73fac0
})();
