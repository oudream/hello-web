let cjAjax = {
    version: '1.0.1',
};

// function init () {
// window.cjAjax = {};
//
// var cjAjax = window.cjAjax;

/**
 * cxAjax.post(url, callBack_fn, fn_param);
 * @param sendData
 * @param callBack_fn
 * @param params
 */
cjAjax.getUrlParamsString = function(urlParams) {
    if (!urlParams) return '';
    let r = new Array(urlParams.length);
    let i = 0;
    for (let key in urlParams) {
        r[i++] = key + '=' + urlParams[key];
    }
    return r.join('&');
};

/**
 * @param ajaxParams = {
        url: '',
        urlParams: null,
        sendData: '',
        sendDataType: '',
        callback:null,
        callbackParams:null
    };
 */
cjAjax.createAjaxParams = function() {
    let ajaxParams = {
        url: '',
        urlParams: null,
        sendData: '',
        sendDataType: '',
        callback: null,
        callbackParams: null,
    };
    return ajaxParams;
};

cjAjax.request = function(ajaxParams) {
    if (!ajaxParams.url) {
        console.log('cjAjax.request ajaxParams.url is null');
        return;
    }
    if (!ajaxParams.callback) {
        console.log('cjAjax.request ajaxParams.callback is null');
        return;
    }
    let xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
  // *特定IP
  // xmlhttp.open("post", "http:// 10.31.16.253:8821/ics/xxx.cgi?fncode=req.sql.", true);
    let sMethod = ajaxParams.sendData ? 'post' : 'get';
    let sUrl = ajaxParams.url + '?' + cjAjax.getUrlParamsString(ajaxParams.urlParams);
  // xmlhttp.open(sMethod, ajaxParams.url, true);
    xmlhttp.open(sMethod, sUrl, true);
  // *跨域授权
  // xmlhttp.setRequestHeader("POWERED-BY-AID", "Approve");
  // xmlhttp.setRequestHeader('Content-Type', 'json');
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            let res = {};
            if (xmlhttp.status == 200) {
                res = JSON.parse(xmlhttp.response);
                res['http_status'] = 200;
            } else {
                res['http_status'] = xmlhttp.status;
            }

            ajaxParams.callback(JSON.stringify(res), ajaxParams);
        }
    // if (xmlhttp.readyState==4 && xmlhttp.status==200) {
    //     ajaxParams.callback(xmlhttp.response, ajaxParams);
    // }
    };
    let sSendDataType = ajaxParams.sendDataType ? ajaxParams.sendDataType : 'application/json';
    xmlhttp.setRequestHeader('Content-Type', sSendDataType);
    if (ajaxParams.sendData) {
        let r = xmlhttp.send(ajaxParams.sendData);
        console.log();
    } else {
        xmlhttp.send();
    }
};

cjAjax.post = function(url, callBack_fn, param1) {
    let xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
  // xmlhttp.open("post", "http:// 10.31.16.253:8821/ics/xxx.cgi?fncode=req.sql.", true);
  // xmlhttp.open("post", "http:// 10.31.16.73:8821/ics/xxx.cgi?fncode=req.sql.", true);
    xmlhttp.open('post', 'ics.cgi?fncode=req.sql.', true);
    xmlhttp.setRequestHeader('POWERED-BY-AID', 'Approve');
    xmlhttp.setRequestHeader('Content-Type', 'json');

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callBack_fn(xmlhttp.response, param1);
        }
    };
    return xmlhttp.send(url);
};

// }

if (typeof module === 'object') {
    if (module.exports) {
        module.exports = cjAjax;
    }
} else {
    window.cjAjax = cjAjax;
}
