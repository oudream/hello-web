/**
 * Created by oudream on 2017/1/11.
 */

(function() {
    'use strict';

    var CjHtml = CjHtml || {};

    if ( typeof window === 'object' ) {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at  web browser');
    }

    cjs.CjHtml = CjHtml;
    /**
     * escape html character
     * @param {string} str
     * @returns {string}
     */
    CjHtml.escapeHtml = function escapeHtml(str) {
        return str.replace(/[<>'&]/g,
            function(match) {
                switch (match) {
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '&':
                    return '&amp;';
                case '\'':
                    return '&quot;';
                }
            }
        );
    };

    CjHtml.cumulativeOffset = function(element) {
        let top = 0, left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);

        return {
            top: top,
            left: left,
        };
    };

    /**
     * 获取元素所有属性
     * @param elem: 元素
     * @returns {{}}: 属性对象
     */
    CjHtml.getAllAttrOfElem = function(elem) {
        let attrs = elem.attributes;
        let attrObj = {};
        let i;
        for (i = 0; i < attrs.length; i++) {
            let attr = attrs[i];
            attrObj[attr.nodeName] = attr.value;
        }

        return attrObj;
    };

    /**
     * 由相对路径转换成绝对路径
     * @param url : 相对路径
     * @returns {*}
     */
    CjHtml.getAbsoluteUrl = function(url) {
        let a = document.createElement('a');
        a.href = url;  // 设置相对路径给Image, 此时会发送出请求
        url = a.href;  // 此时相对路径已经变成绝对路径
        a = null;

        return url;
    };
})();
