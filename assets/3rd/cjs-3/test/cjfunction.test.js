/**
 * Created by oudream on 2016/12/29.
 */

require('./../cjfunction');
let expect = require('./../../3rd/chai-3.5.0').expect;

describe('CjFunction', function() {
    it('getFunctionObject empty', function() {
        expect(cjs.CjFunction.getFunctionObject()).to.deep.equal({
            type: null,
            name: '',
            content: '',
            arguments: null,
        });
    });

    it('getFunctionObject', function() {
        function fn1() {
            expect(cjs.CjFunction.getFunctionObject(fn1, arguments)).to.deep.equal({
                type: 'function',
                name: 'fn1',
                content: fn1.toString(),
                arguments: arguments,
            });
        }
        fn1(true, {a: 'a', b: 1});
    });
});
