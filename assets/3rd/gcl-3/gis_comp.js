/* !
 *
 */

(function() {
    let gcl = window.gcl;
    if (!gcl || !gcl.rtdb) return;
    let rtdb = gcl.rtdb;

    gcl.gis = gcl.gis || {};
    let gis = gcl.gis;

    if (gis.comp) return;
    gis.comp = gis.comp || {};
    let comp = gis.comp;

    let myDebug = gcl.debug || function() {
        console.log.apply(null, arguments);
    };

    const csMeasureCurveUiPrefix = 'show-rt-curve-';

    // [{view: 'view', mid: 0, curve: curve}]
    let _measureCurves = [];

    let showMeasureCurve = (measureId) => {
        // #highcharts

        Highcharts.setOptions({
            global: {
                useUTC: false,
            },
        });

        let curve = {
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load() {
                        // set up the updating of the chart each second
                        let series = this.series[0];
                        let measure = rtdb.findMeasureById(measureId);
                        if (measure === null) {
                            return;
                        }
                        if (this.measureCurveStartRefreshTm) {
                            clearInterval(this.measureCurveStartRefreshTm);
                        }
                        this.measureCurveStartRefreshTm = setInterval(function() {
                            // let dt = measure.changedTime > 0 ? (new Date(measure.changedTime)) : (new Date(0));
                            let dt = Date.now();
                            let x = dt, // current time
                                y = measure.value;
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    },
                },
            },
            title: {
                text: '温度实时',
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150,
            },
            yAxis: {
                title: {
                    text: '华氏度',
                },
                plotLines: [{
                    value: 0,
                    width: 100,
                    color: '#808080',
                }],
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + this.series.name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, 2);
                },
            },
            legend: {
                enabled: false,
            },
            exporting: {
                enabled: false,
            },
            series: [{
                name: 'Random data',
                data: (function() {
                    // generate an array of random data
                    let data = [],
                        time = (new Date()).getTime(),
                        i;

                    data.push({x: time + (-20 * 1000), y: 0});
                    data.push({x: time + (-19 * 1000), y: 0});

                    for (i = -18; i < 0; i += 1) {
                        data.push({
                            x: time + i * 1000,
                            y: 0,
                        });
                    }
                    return data;
                }()),
            }],
        };

        Highcharts.chart(csMeasureCurveUiPrefix + measureId, curve);

        return curve;
    };

    comp.startView = function(view) {
        let parentNode = view ? view : document;
        let viewName = view ? view.id : 'main';

        let svgMids = parentNode.querySelectorAll('[id^=\'' + csMeasureCurveUiPrefix + '\']');
        svgMids.forEach(ele => {
            let m = ele.id.match(new RegExp(csMeasureCurveUiPrefix+'(.*)'));
            if (Array.isArray(m)) {
                let mid = Number.parseInt(m[1]);
                rtdb.appendMeasureById(mid);
                let curve = showMeasureCurve(mid);
                _measureCurves.push({view: viewName, mid: mid, curve: curve});
            }
        });
    };

    let closeCurveByView = function(view) {
        let delMids = [];
        _measureCurves.forEach(mc => {
            if (mc.view === view) {
                if (mc.curve.measureCurveStartRefreshTm) {
                    clearInterval(mc.curve.measureCurveStartRefreshTm);
                    mc.curve.measureCurveStartRefreshTm = undefined;
                }
                delMids.push(mc.mid);
            }
        });
        return delMids;
    };

    comp.stopView = function(view) {
        let parentNode = view ? view : document;
        let viewName = view ? view.id : 'main';
        let delMids = closeCurveByView(viewName);
        delMids.forEach(i => rtdb.removeMeasureById(i));
    };

})(typeof window !== 'undefined' ? window : this);
