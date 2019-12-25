(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjDate = cjs.CjDate || {};
    cjs.CjDate = CjDate;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjDate;
    }

    if (CjDate.hasOwnProperty('equalCase')) return;

  // '2016-12-27 16:09:14'
    CjDate.defaultDateString = function(dt) {
        let dt2 = dt instanceof Date ? dt : new Date();
        let D = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
        return [
            [dt2.getFullYear(), D[dt2.getMonth() + 1] || dt2.getMonth() + 1, D[dt2.getDate()] || dt2.getDate()].join('-'),
            [D[dt2.getHours()] || dt2.getHours(), D[dt2.getMinutes()] || dt2.getMinutes(), D[dt2.getSeconds()] || dt2.getSeconds()].join(':'),
        ].join(' ');
    };

  // '2016-12-27'
    CjDate.defaultDayString = function(dt) {
        let dt2 = dt instanceof Date ? dt : new Date();
        let D = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
        return [dt2.getFullYear(), D[dt2.getMonth() + 1] || dt2.getMonth() + 1, D[dt2.getDate()] || dt2.getDate()].join('-');
    };

  // '16:09:14'
    CjDate.defaultTimeString = function(dt) {
        let dt2 = dt instanceof Date ? dt : new Date();
        let D = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
        return [D[dt2.getHours()] || dt2.getHours(), D[dt2.getMinutes()] || dt2.getMinutes(), D[dt2.getSeconds()] || dt2.getSeconds()].join(':');
    };

  /**
   *
   * @param fmt
   * @returns {*}
   */
  // console.log(CjDate.formatDate("yyyy年MM月dd日 hh:mm:ss.S")); //输出: 2016年04月01日 10:41:08.133
  // console.log(CjDate.formatDate("yyyy-MM-dd hh:mm:ss")); //输出: 2016-04-01 10:41:08
  // console.log(CjDate.formatDate("yy-MM-dd hh:mm:ss")); //输出: 16-04-01 10:41:08
  // console.log(CjDate.formatDate("yy-M-d hh:mm:ss")); //输出: 16-4-1 10:41:08
    CjDate.formatDate = function formatDate(fmt, dt) {
        let dt2 = dt instanceof Date ? dt : new Date();
        let o = {
            'y+': dt2.getFullYear(),
            'M+': dt2.getMonth() + 1,
            'd+': dt2.getDate(),
            'h+': dt2.getHours(),
            'm+': dt2.getMinutes(),
            's+': dt2.getSeconds(),
            'q+': Math.floor((dt2.getMonth() + 3) / 3), // 季度
            'S+': dt2.getMilliseconds(),
        };
        for (let k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                if (k === 'y+') {
                    fmt = fmt.replace(RegExp.$1, ('' + o[k]).substr(4 - RegExp.$1.length));
                } else if (k === 'S+') {
                    let lens = RegExp.$1.length;
                    lens = lens === 1 ? 3 : lens;
                    fmt = fmt.replace(RegExp.$1, ('00' + o[k]).substr(('' + o[k]).length - 1, lens));
                } else {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
                }
            }
        }
        return fmt;
    };
})();
