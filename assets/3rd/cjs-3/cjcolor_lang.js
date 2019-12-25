/**
 * Created by oudream on 2016/12/21.
 */

(function() {
    'use strict';

    if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at web browser');
    }
    let CjColor = cjs.CjColor || {};
    cjs.CjColor = CjColor;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjColor;
    }

    // 十六进制颜色值的正则表达式
    CjColor.colorValueReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

    /**
     * RGB颜色转换为16进制
     * @param str
     * @returns {string}
     * sample : colorHex('RGB(23, 245, 56)'); result: '#17f538'
     */
    CjColor.colorHex = function colorHex(str) {
        let reg = CjColor.colorValueReg;
        let that = str;
        if (/^(rgb|RGB)/.test(that)) {
            let aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
            let strHex = '#';
            for (var i = 0; i < aColor.length; i++) {
                let hex = Number(aColor[i]).toString(16);
                if (hex === '0') {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = that;
            }
            return strHex;
        } else if (reg.test(that)) {
            let aNum = that.replace(/#/, '').split('');
            if (aNum.length === 6) {
                return that;
            } else if (aNum.length === 3) {
                let numHex = '#';
                for (var i = 0; i < aNum.length; i += 1) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return that;
        }
    };

    /**
     * 16进制颜色转为RGB格式
     * @param str
     * @returns {string}
     * sample : colorRgb('#34538b'); result : 'RGB(52,83,139)'
     */
    CjColor.colorRgb = function(str) {
        let reg = CjColor.colorValueReg;
        let sColor = str.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                let sColorNew = '#';
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            // 处理六位的颜色值
            let sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
            }
            return 'RGB(' + sColorChange.join(',') + ')';
        } else {
            return sColor;
        }
    };

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     * HSL颜色值转换为RGB.
     * 换算公式改编自 http://en.wikipedia.org/wiki/HSL_color_space.
     * h, s, 和 l 设定在 [0, 1] 之间
     * 返回的 r, g, 和 b 在 [0, 255]之间
     *
     * @param   {number}  h  色相     The hue
     * @param   {number}  s  饱和度     The saturation
     * @param   {number}  l  亮度     The lightness
     * @return  {Array}      RGB色值数值     The RGB representation
     */
    CjColor.hslToRgb = function hslToRgb(h, s, l) {
        let r, g, b;
        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     * RGB 颜色值转换为 HSL.
     * 转换公式参考自 http://en.wikipedia.org/wiki/HSL_color_space.
     * r, g, 和 b 需要在 [0, 255] 范围内
     * 返回的 h, s, 和 l 在 [0, 1] 之间
     *
     * @param   {number}  r  红色色值    The red color value
     * @param   {number}  g  绿色色值    The green color value
     * @param   {number}  b  蓝色色值    The blue color value
     * @return  {Array}      HSL各值数组    The HSL representation
     */
    CjColor.rgbToHsl = function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h, s, l];
    };
})();
