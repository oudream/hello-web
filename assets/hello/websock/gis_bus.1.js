(function() {
    'use strict';

    window.gis_bus = window.gis_bus || {};
    let bus = window.gis_bus;

    let neNo = [];
    let signal = [];
    let scheme = {};
    let pretreatment = {};

    $.getJSON('/hello/cc4k/gis_bus.1.json', function(data) {
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
    function dealUiScheme(obj, item, cfg) {
        let svgMeasure;
        svgMeasure = $(`#${obj.id}`);
        let dealData = null;
        if (obj.pretreatment) {
            let arrs = obj.pretreatment.split('?');
            if (arrs.length > 0 && pretreatment[arrs[0]]) {
                let para;
                if (arrs.length > 1) {
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

})();
