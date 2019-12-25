/**
 * Created by oudream on 2016/12/29.
 */

/**
 *
 01.
 first	1st	11.
 eleventh	11th
 02.
 second	2nd	12.
 twelfth	12th
 03.
 third	3rd	13.
 thirteenth	13th
 04.
 fourth	4th	14.
 fourteenth	14th
 05.
 fifth	5th	15.
 fifteenth	15th
 06.
 sixth	6th	16.
 sixteenth	16th
 07.
 seventh	7th	17.
 seventeenth	17th
 08.
 eighth	8th	18.
 eighteenth	18th
 09.
 ninth	9th	19.
 nineteenth	19th
 10.
 tenth	10th	20.
 twentieth	20th


 01.
 twenty-first	21st	11.
 fiftieth	50th
 02.
 twenty-second	22nd	12.
 sixtieth	60th
 03.
 twenty-third	23rd	13.
 seventieth	70th
 04.
 twenty-fourth	24th	14.
 eightieth	80th
 05.
 twenty-fifth	25th	15.
 ninetieth
 90th
 06.
 twenty-sixth	26th	16.
 one hundredth	100th
 07.
 twenty-seventh	27th	17.
 one thousandth	1,000th
 08.
 twenty-eighth	28th	18.
 one millionth	1,000,000th
 09.
 twenty-ninth	29th	19.
 seventy-fifth	75th
 10.
 thirtieth	30th	20.
 ninety-ninth	99th
 11.
 thirty-first	31st	21.
 103rd
 12.
 fortieth	40th	22.
 532nd
 *
 */
require('./../cjnumber');
let expect = require('./../../3rd/chai-3.5.0').expect;


describe('CjNumber', function() {
    it('1st', function() {
        expect((1).toOrdinal()).to.equal('1st');
    });

    it('2nd', function() {
        expect((2).toOrdinal()).to.equal('2nd');
    });

    it('3rd', function() {
        expect((3).toOrdinal()).to.equal('3rd');
    });

    it('4th', function() {
        expect((4).toOrdinal()).to.equal('4th');
    });


    it('11th', function() {
        expect((11).toOrdinal()).to.equal('11th');
    });

    it('12th', function() {
        expect((12).toOrdinal()).to.equal('12th');
    });

    it('13th', function() {
        expect((13).toOrdinal()).to.equal('13th');
    });

    it('14th', function() {
        expect((14).toOrdinal()).to.equal('14th');
    });


    it('21st', function() {
        expect((21).toOrdinal()).to.equal('21st');
    });

    it('22nd', function() {
        expect((22).toOrdinal()).to.equal('22nd');
    });

    it('23rd', function() {
        expect((23).toOrdinal()).to.equal('23rd');
    });

    it('24th', function() {
        expect((24).toOrdinal()).to.equal('24th');
    });
});
