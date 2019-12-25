/**
 * Created by oudream on 2016/12/23.
 */

(function() {
    'use strict';

    var CjEnv = CjEnv || {};

    if ( typeof window === 'object' ) {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at  web browser');
    }

    cjs.CjEnv = CjEnv;

    /**
     * get url params
     * @param name
     * @returns {*}
     */
    CjEnv.getUrlParam = function getUrlParam(name) {
        let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        let r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]); return null;
    };

    // 获取本地时间
    // 只要到分钟就可以了，new Date().toLocaleString().replace(/:\d{1,2}$/,' ');
    CjEnv.getLocalTime = function() {
        if ( arguments.length == 0 ) {
            return new Date().toLocaleString();
        }
        let iDt = parseInt(arguments[0]);
        if (iDt < 0x7FFFFFFF) iDt = iDt * 1000;
        return new Date(iDt).toLocaleString();
    };

    CjEnv.getServerInfo = function() {
        let protocol = window.location.protocol;
        let host = window.location.host;
        let port = window.location.port;

        return {
            'protocol': protocol,
            'host': host,
            'port': port,
        };
    };
})();
