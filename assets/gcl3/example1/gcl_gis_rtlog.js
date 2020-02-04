/*!
 *
 */
(function () {

    window.gcl = window.gcl || {};
    window.gcl.gis = window.gcl.gis || {};

    var gis = window.gcl.gis;

    if (gis.debug) return;

    gis.debug = function () {
        console.log.apply(null, arguments);
    };

    gis.rtdataStartRefresh = function () {
        let csRtdataUiPrefix = 'show-rtdata-';
        let rtdb = gcl.rtdb;
        let monsbManager = rtdb.monsbManager;
        let monsbs = monsbManager.monsbs;
        let ycaddManager = rtdb.ycaddManager;
        let ycadds = ycaddManager.ycadds;
        let strawManager = rtdb.strawManager;
        let straws = strawManager.straws;

        let svgMids = $("text[id^='"+csRtdataUiPrefix+"']");
        svgMids.each(function () {
            let name = this.id;
            let index = name.indexOf(csRtdataUiPrefix);
            if (index >= 0) {
                let sMid = name.substring(index + 12);
                let iId = Number(sMid);
                if (iId >= 0x01000000 && iId < 0x02000000) {
                    monsbManager.append(iId);
                } else if (iId >= 0x02000000 && iId < 0x03000000) {
                    ycaddManager.append(iId);
                } else if (iId >= 0x03000000 && iId < 0x04000000) {
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

        }

        setInterval(showMeasuresTimeOut, 1000);
    };

    gis.rtdataStartRefresh();
})(typeof window !== "undefined" ? window : this);
