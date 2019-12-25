/**
 * Created by oudream on 2016/12/31.
 */

require('./../cjencoding_charset');
let expect = require('./../../3rd/chai-3.5.0').expect;


describe('CjEncodingCharset', function() {
    it('ucs2ToGb2312Url & gd2312ToUcs2', function() {
        let str = cjs.CjEncodingCharset.ucs2ToGb2312Url('你');
        str = str.replace(/%/g, '');
        let iStr = Number.parseInt(str, 16);
        let str2 = String.fromCharCode(iStr);
        // console.log(str);
        let iStr2 = str2.charCodeAt(0);
        // console.log(iStr2);
        let sGbk = cjs.CjEncodingCharset.gd2312ToUcs2(str2);
        // console.log(sGbk);;
        expect(sGbk).to.equal('你');
    });

    it('ucs2ToGb2312Url & gd2312ToUcs2', function() {
        let utf8data = cjs.CjEncodingCharset.ucs2ToUtf8data('你');
        expect(cjs.CjEncodingCharset.utf8dataToUcs2(utf8data)).to.equal('你');
    });
});

