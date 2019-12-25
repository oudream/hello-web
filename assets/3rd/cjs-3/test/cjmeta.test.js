/**
 * Created by oudream on 2016/12/16.
 */

require('./../cjmeta');
let expect = require('./../../3rd/chai-3.5.0').expect;

describe('CjMeta', function() {
    it('getObjectClassName', function() {
        function Obj1() { }
        let obj1 = new Obj1();
        // var util = require('util');
        // util.inherits(obj, Object);
        // console.log('xxxxx1:'+cjs.CjMeta.getObjectClassName(obj1));
        Object.setPrototypeOf(Obj1.prototype, Object.prototype);
        expect(cjs.CjMeta.getObjectClassName(obj1)).to.equal('Obj1');
    });
});
