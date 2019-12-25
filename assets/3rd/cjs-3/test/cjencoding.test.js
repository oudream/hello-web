/**
 * Created by oudream on 2016/12/29.
 */

require('./../cjencoding');
let expect = require('./../../3rd/chai-3.5.0').expect;


describe('CjEncoding', function() {
    it('base64Encode or base64Decode', function() {
        let strOrig = 'Hello, world';
        let strEncode = 'SGVsbG8sIHdvcmxk';
        let strEncode2 = cjs.CjEncoding.base64Encode(strOrig);
        let strOrig2 = cjs.CjEncoding.base64Decode(strEncode);
        expect(strEncode).to.equal(strEncode2);
        expect(strOrig).to.equal(strOrig2);
    });

    it('base64Encode to2 base64Decode', function() {
        let strOrig = '123456789.;/abcdefgaquwerpozcxv地人为';
        let strEncode2 = cjs.CjEncoding.base64Encode(strOrig);
        let strOrig2 = cjs.CjEncoding.base64Decode(strEncode2);
        expect(strOrig).to.equal(strOrig2);
    });
});

