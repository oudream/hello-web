(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjBuffer = cjs.CjBuffer || {};
    cjs.CjBuffer = CjBuffer;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjBuffer;
    }

    if (CjBuffer.hasOwnProperty('packI8')) {
        return;
    }

    CjBuffer.asSigned = function(value, bits) {
        let s = 32 - bits;
        return (value << s) >> s;
    };

    CjBuffer.asUnsigned = function(value, bits) {
        let s = 32 - bits;
        return (value << s) >>> s;
    };

    CjBuffer.packI8 = function(n) {
        return [n & 0xff];
    };

    CjBuffer.unpackI8 = function(bytes) {
        return CjBuffer.asSigned(bytes[0], 8);
    };

    CjBuffer.packU8 = function(n) {
        return [n & 0xff];
    };

    CjBuffer.unpackU8 = function(bytes) {
        return CjBuffer.asUnsigned(bytes[0], 8);
    };

    CjBuffer.packU8Clamped = function(n) {
        n = Math.round(Number(n));
        return [n < 0 ? 0 : n > 0xff ? 0xff : n & 0xff];
    };

    CjBuffer.packI16 = function(n) {
        return [n & 0xff, (n >> 8) & 0xff];
    };

    CjBuffer.unpackI16 = function(bytes) {
        return CjBuffer.asSigned(bytes[1] << 8 | bytes[0], 16);
    };

    CjBuffer.packU16 = function(n) {
        return [n & 0xff, (n >> 8) & 0xff];
    };

    CjBuffer.unpackU16 = function(bytes) {
        return CjBuffer.asUnsigned(bytes[1] << 8 | bytes[0], 16);
    };

    CjBuffer.packI32 = function(n) {
        return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
    };

    CjBuffer.unpackI32 = function(bytes) {
        return CjBuffer.asSigned(bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0], 32);
    };

    CjBuffer.packU32 = function(n) {
        return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
    };

    CjBuffer.unpackU32 = function(bytes) {
        return CjBuffer.asUnsigned(bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0], 32);
    };

    CjBuffer.packIEEE754 = function(v, ebits, fbits) {
        let bias = (1 << (ebits - 1)) - 1;

        function roundToEven(n) {
            let w = Math.floor(n);
            let f = n - w;
            if (f < 0.5) {
                return w;
            }
            if (f > 0.5) {
                return w + 1;
            }
            return w % 2 ? w + 1 : w;
        }

    // Compute sign, exponent, fraction
        let s, e, f;
        if (v !== v) {
      // NaN
      // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
            e = (1 << ebits) - 1;
            f = Math.pow(2, fbits - 1);
            s = 0;
        } else if (v === Infinity || v === -Infinity) {
            e = (1 << ebits) - 1;
            f = 0;
            s = (v < 0) ? 1 : 0;
        } else if (v === 0) {
            e = 0;
            f = 0;
            s = (1 / v === -Infinity) ? 1 : 0;
        } else {
            s = v < 0;
            v = Math.abs(v);

            if (v >= Math.pow(2, 1 - bias)) {
        // Normalized
                e = Math.min(Math.floor(Math.log(v) / LN2), 1023);
                let significand = v / Math.pow(2, e);
                if (significand < 1) {
                    e -= 1;
                    significand *= 2;
                }
                if (significand >= 2) {
                    e += 1;
                    significand /= 2;
                }
                let d = Math.pow(2, fbits);
                f = roundToEven(significand * d) - d;
                e += bias;
                if (f / d >= 1) {
                    e += 1;
                    f = 0;
                }
                if (e > 2 * bias) {
          // Overflow
                    e = (1 << ebits) - 1;
                    f = 0;
                }
            } else {
        // Denormalized
                e = 0;
                f = roundToEven(v / Math.pow(2, 1 - bias - fbits));
            }
        }

    // Pack sign, exponent, fraction
        let bits = [];
        let i;
        for (i = fbits; i; i -= 1) {
            bits.push(f % 2 ? 1 : 0);
            f = Math.floor(f / 2);
        }
        for (i = ebits; i; i -= 1) {
            bits.push(e % 2 ? 1 : 0);
            e = Math.floor(e / 2);
        }
        bits.push(s ? 1 : 0);
        bits.reverse();
        let str = bits.join('');

    // Bits to bytes
        let bytes = [];
        while (str.length) {
            bytes.unshift(parseInt(str.substring(0, 8), 2));
            str = str.substring(8);
        }
        return bytes;
    };

    CjBuffer.unpackIEEE754 = function(bytes, ebits, fbits) {
    // Bytes to bits
        let bits = [];
        let i, j, b, str, bias, s, e, f;

        for (i = 0; i < bytes.length; ++i) {
            b = bytes[i];
            for (j = 8; j; j -= 1) {
                bits.push(b % 2 ? 1 : 0);
                b = b >> 1;
            }
        }
        bits.reverse();
        str = bits.join('');

    // Unpack sign, exponent, fraction
        bias = (1 << (ebits - 1)) - 1;
        s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
        e = parseInt(str.substring(1, 1 + ebits), 2);
        f = parseInt(str.substring(1 + ebits), 2);

    // Produce number
        if (e === (1 << ebits) - 1) {
            return f !== 0 ? NaN : s * Infinity;
        } else if (e > 0) {
      // Normalized
            return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
        } else if (f !== 0) {
      // Denormalized
            return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
        } else {
            return s < 0 ? -0 : 0;
        }
    };

    CjBuffer.unpackF64 = function(b) {
        return CjBuffer.unpackIEEE754(b, 11, 52);
    };

    CjBuffer.packF64 = function(v) {
        return CjBuffer.packIEEE754(v, 11, 52);
    };

    CjBuffer.unpackF32 = function(b) {
        return CjBuffer.unpackIEEE754(b, 8, 23);
    };

    CjBuffer.packF32 = function(v) {
        return CjBuffer.packIEEE754(v, 8, 23);
    };
})();
