/*!
 *
 */

(function () {
    window.gcl = window.gcl || {};
    window.gcl.gis = window.gcl.gis || {};
    window.gcl.gis.uiRtdb = window.gcl.gis.uiRtdb || {};
    window.gcl.gis.uiRtcurve = window.gcl.gis.uiRtcurve || {};
    window.gcl.gis.uiRtlog = window.gcl.gis.uiRtlog || {};

    let gcl = window.gcl;
    let gis = gcl.gis;
    let uiRtdb = gis.uiRtdb;
    let uiRtcurve = gis.uiRtcurve;
    let uiRtlog = gis.uiRtlog;

    let myDebug = gcl.debug || function () {
        console.log.apply(null, arguments);
    };

    uiRtdb.rtdataStartRefresh = function () {
        let csRtdataUiPrefix = 'show-rtdata-';
        let rtdb = gcl.rtdb;
        if (rtdb === null) {
            myDebug('!!!warning-rtdataStartRefresh. rtdb is null.');
            return;
        }
        let monsbManager = rtdb.monsbManager;
        if (monsbManager === null) {
            myDebug('!!!warning-rtdataStartRefresh. rtdb.monsbManager is null.');
            return;
        }
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
                rtdb.appendMeasureById(sMid);
                myDebug('rtdb.appendById: ', sMid);
            }
        });

        let showMeasuresTimeOut = function () {
            // * yx
            for (let i = 0; i < monsbs.length; i++) {
                let monsb = monsbs[i];
                let iMid = monsb.id;
                let sMid = String(iMid);
                let svgMeasure = d3.select("[id=" + csRtdataUiPrefix + sMid + "]");
                if (svgMeasure !== null) {
                    let iRemain = monsb.value % 3;
                    if (iRemain === 0)
                        svgMeasure.attr("fill", "#ff0000");
                    else if (iRemain === 1)
                        svgMeasure.attr("fill", "#00ff00");
                    else
                        svgMeasure.attr("fill", "#0000ff");
                }
            }
            // * yc
            for (let i = 0; i < ycadds.length; i++) {
                let ycadd = ycadds[i];
                let iMid = ycadd.id;
                let sMid = String(iMid);
                let sValue = String(ycadd.value);
                let svgMeasure = d3.select("[id=" + csRtdataUiPrefix + sMid + "]");
                if (svgMeasure !== null) {
                    svgMeasure.text(sValue);
                }
            }
            // * yw
            for (let i = 0; i < straws.length; i++) {
                let straw = straws[i];
                let iMid = straw.id;
                let sMid = String(iMid);
                let sValue = String(straw.value);
                let svgMeasure = d3.select("[id=" + csRtdataUiPrefix + sMid + "]");
                if (svgMeasure !== null) {
                    svgMeasure.text(sValue);
                }
            }

        };

        setInterval(showMeasuresTimeOut, 1000);
    };

    uiRtcurve.rtcurveStartRefresh = function () {
        let csRtcurveUiPrefix = 'show-rt-curve-';
        let rtdb = gcl.rtdb;
        let monsbManager = rtdb.monsbManager;
        let monsbs = monsbManager.monsbs;
        let ycaddManager = rtdb.ycaddManager;
        let ycadds = ycaddManager.ycadds;
        let strawManager = rtdb.strawManager;
        let straws = strawManager.straws;

        // #highcharts
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        function activeLastPointToolip(chart) {
            var points = chart.series[0].points;
            chart.tooltip.refresh(points[points.length -1]);
        }
        let showRtcurve = function (measureId) {
            Highcharts.chart(csRtcurveUiPrefix + measureId, {
                chart: {
                    type: 'spline',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        load: function () {

                            // set up the updating of the chart each second
                            let series = this.series[0];
                            let measure = rtdb.findMeasureById(measureId);
                            if (measure === null) {
                                return;
                            }
                            setInterval(function () {
                                let x = (new Date(measure.changedTime)).getTime(), // current time
                                    y = measure.value;
                                series.addPoint([x, y], true, true);
                            }, 1000);
                        }
                    }
                },
                title: {
                    text: '温度实时'
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 150
                },
                yAxis: {
                    title: {
                        text: '华氏度'
                    },
                    plotLines: [{
                        value: 0,
                        width: 100,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + '</b><br/>' +
                            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                            Highcharts.numberFormat(this.y, 2);
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    name: 'Random data',
                    data: (function () {
                        // generate an array of random data
                        var data = [],
                            time = (new Date()).getTime(),
                            i;

                        data.push({x: time + (-19 * 1000), y: 0});
                        data.push({x: time, y: 100});

                        for (i = -18; i < 0; i += 1) {
                            data.push({
                                x: time + i * 1000,
                                y: 0
                            });
                        }
                        return data;
                    }())
                }]
            });
        };

        let svgMids = $("div[id^='" + csRtcurveUiPrefix + "']");
        svgMids.each(function () {
            let name = this.id;
            let index = name.indexOf(csRtcurveUiPrefix);
            if (index >= 0) {
                let sMid = name.substring(index + 14);
                rtdb.appendMeasureById(sMid);
                showRtcurve(sMid);
                myDebug('rtdb.appendById: ', sMid);
            }
        });
    };

})(typeof window !== "undefined" ? window : this);
