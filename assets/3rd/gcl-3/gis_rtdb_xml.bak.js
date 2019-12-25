/*!

// GCL实时点的历史实时数据请求的 json格式：支持散列请求：rtlog_v101；数组请求是：rtlog_v102；返回时都统一用：rtlog_v001
// url 是全局统一资源名（可以通用在容器对象或实体对象中）
// mid 是实时库的实时点全局唯一id
// url和mid可以只有一个，两个同时都有时以mid为准
// http://10.31.0.15:8821/ics.cgi?fncode=req.rtlog_v101&filetype=json

// 散列请求：rtlog_v101
fncode = req.rtlog_v101
filetype = json

{
  "session":"sbid=0001;xxx=adfadsf",
  "structtype": "rtlog_v101",
  "params":
  [
    {
    "url": "/fp/zyj/fgj01/rfid",
    "mid": 33556644,
    "dtday": "20180329",
    "dtbegin": 31343242341,
    "dtend": 23413241234
    },
    {
    "url": "/fp/zyj/fgj01/ypmm",
    "mid": 33556645,
    "dtday": "20180329",
    "dtbegin": 31343242341,
    "dtend": 23413241234
    }
  ]
}


// ics.json返回时都统一用：rtlog_v001
// "v": 数值；数组形式
// "q": 值的质量；数组形式
// "t": 值的时间,unix时间戳（1970到目前的毫秒数，服务器的当地时间）；数组形式
// "s": 实时数据信息来源的源ID,ChangedSourceId；数组形式
// "u": 实时数据信息来源的源url,ChangedSourceId；数组形式
// "r": ChangedReasonId；数组形式
// 可选属性"state":状态码，无或0时表示成功，其它值看具体数据字典
{
  "session":"sbid=0001;xxx=adfadsf",
  "structtype":"rtdata_v001",
  "data":[
    {
    "url":"/fp/zyj/fgj01/rfid",
    "mid":33556644,
    "dtday": "20180329",
    "dtbegin": 31343242341,
    "dtend": 23413241234,
    "log": "#logfile.text",
    "state":0
    },
    {
    "url":"/fp/zyj/fgj01/ypmm",
    "mid":33556645,
    "dtday": "20180329",
    "dtbegin": 31343242341,
    "dtend": 23413241234,
    "log": "#logfile.text",
    "state":0
    }
  ]
}

 */

(function () {

    if (window.gclRtLog) {
        return;
    }
    window.gclRtLog = function () {

        var gis = {};

        function fn_outInfo(s) {
            var svgOutInfo = d3.select("text[id=sys-send-time]");
            svgOutInfo.text(Date() + "  " + r);
        }



        function getReqMeasureStringXML() {
            var CS_req_measure_head =
                '<?xml version="1.0" encoding="utf-8"?>' +
                '<YGCT>' +
                '<HEAD>' +
                '<VERSION>1.0</VERSION>' +
                '<SRC>1200000003</SRC>' +
                '<DES>1200000003</DES>' +
                '<MsgNo>9991</MsgNo>' +
                '<MsgId>91d9e512-3695-4796-b063-306544be6f1f</MsgId>' +
                '<MsgRef/>' +
                '<TransDate>20151215094317</TransDate>' +
                '<Reserve/>' +
                '</HEAD>' +
                '<MSG>'
            ;

            var CS_req_measure_body =
                '<RealData9991>' +
                '<ADDRESSES>%1</ADDRESSES>' +
                '</RealData9991>'
            ;

            var CS_req_measure_foot =
                '</MSG>' +
                '</YGCT>'
            ;

            var sMids = "";
            var svgMid = d3.select("svg").selectAll("[id]");
            svgMid.each(function (d, i) {
                var name = this.id;
                var index = name.indexOf("mid-");
                if (index >= 0) {
                    sMids += name.substring(index + 4) + ",";
                }
            });
            if (sMids.length > 0) {
                CS_req_measure_body = CS_req_measure_body.replace(/%1/, sMids);
                return CS_req_measure_head + CS_req_measure_body + CS_req_measure_foot;
            }
            return "";
        }

        var timeOut1000 = window.setTimeout("gclRtLog.timeOut()", 1000);

        gis.timeOut = function () {
            req_resp_measures();
            timeOut1000 = window.setTimeout("gclRtLog.timeOut()", 1000);
        }

        var req_resp_measures = function () {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            }
            else if (window.ActiveXObject) {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            var username = document.getElementById("txt_username").value;
            var age = document.getElementById("txt_age").value;
            xmlhttp.open("post", "ics.cgi?username=" + username
                + "&age=" + age, true);
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var svgOutInfo = d3.select("text[id=sys-recved-time]");
                    svgOutInfo.text("接收：" + Date() + "  " + xmlhttp.response.length);
                    var doc = (new DOMParser()).parseFromString(xmlhttp.response, "text/xml");
                    var x = doc.documentElement.getElementsByTagName("RealData9999");
                    for (var i = 0; i < x.length; i++) {
                        try {
                            var xx1 = x[i].getElementsByTagName("ADDRESS");
                            var sMid = xx1[0].textContent;
                            var iMid = Number(sMid);
                            var xx2 = x[i].getElementsByTagName("VALUE");
                            var sValue = xx2[0].textContent;
                            var svgMeasure = d3.select("[id=mid-" + sMid + "]");
                            if (iMid >= 0x01000000 && iMid < 0x02000000) {
                                var iState = Number(sValue);
                                if (iMid == 16777231 || iMid == 16777235) {
                                    var iX = 0 + (iState % 1000);
                                    var iY = 0 + (iState % 10);
                                    if (iMid == 16777235) {
                                        iX = 0 + (iState % 10);
                                        iY = 0 + (iState % 600);
                                    }
                                    var lable = d3.select("[id=outInfoEd]");
                                    var sTransform = "translate(" + iX + "," + iY + ")";
                                    if (iMid == 16777231) {
                                        sTransform += " rotate(90 110,700) "
                                    }
                                    lable.text("transform=" + sTransform);
                                    svgMeasure.attr("transform", sTransform);
//                                    var svg_1 = d3.select("[id=mid-16777235]");
//                                    svg_1.attr("transform", "translate("+(count*10)+","+(480+count%10)+")");
                                    continue;
                                }
                                var iRemain = iState % 3;
                                if (iRemain == 0)
                                    svgMeasure.attr("fill", "#ff0000");
                                else if (iRemain == 1)
                                    svgMeasure.attr("fill", "#00ff00");
                                else
                                    svgMeasure.attr("fill", "#0000ff");
                            }
                            else if (iMid >= 0x02000000 && iMid < 0x03000000) {
                                svgMeasure.text(sValue);
                            }
                            else if (iMid >= 0x03000000 && iMid < 0x04000000) {
                                svgMeasure.text(sValue);
                            }
                        }
                        catch (er) {
                            var body = d3.selectAll("body");
                            var lable = body.append("lable");
                            lable.text("接收到实时数据，但解释异常：" + er.message);
                        }
                    }
                }
            }
            var reqMeasureXml = getReqMeasureStringXML();
            var r = xmlhttp.send(reqMeasureXml);
            var svgOutInfo = d3.select("text[id=sys-send-time]");
            svgOutInfo.text("发送：" + Date() + "  " + r);
//            return {"r":r,"datetime":Date()}
        }



        return gis;
    }();

})(typeof window !== "undefined" ? window : this);
