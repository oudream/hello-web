/**
 * Created by oudream on 2016/12/16.
 */

let fs = require('fs');
let path = require('path');
let http = require('http');

require('./../cjstring');
let expect = require('./../../3rd/chai-3.5.0').expect;


describe('CjString', function() {
    it('', function() {
        expect(cjs.CjString.equalCase('hello!', 'HelLO!')).to.be.ok;
    });
});

describe('a suite of tests', function() {
    expect({foo: 'bar'}).to.deep.equal({foo: 'bar'});


    this.timeout(500);

    it('should take less than 500ms', function(done) {
        setTimeout(done, 300);
    });

    it('should take less than 500ms as well', function(done) {
        setTimeout(done, 250);
    });
});

describe('CjString', function() {
    describe('#http()', function() {
        it('urlToObject', function(done) {
            // var user = new User('Luna');
            // user.save(function(err) {
            //    if (err) done(err);
            //    else done();
            // });

            let runServer = function() {
                var server = http.createServer( function(req, res) {
                    expect(cjs.CjString.urlToObject(req.url)).to.deep.equal({'utm_source': '163.com', 'utm_medium': 'web_studycolumn', 'utm_campai': ''});
                    res.end('CjString Test Complete. Thank You.');
                    server.close();
                    done();
                });

                server.on('checkContinue', function(req, res) {
                    let msg = 'step checkContinue' + Date();
                    res.writeContinue();
                    // console.log(msg);
                });

                server.on('clientError', (err, socket) => {
                    let msg = 'step clientError' + Date();
                    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
                    // console.log(msg);
                });

                server.on('close', function() {
                    let msg = 'step close' + Date();
                    // console.log(msg);
                });

                server.on('connect', function(req, socket, firstBodyChunk) {
                    let msg = 'step connect' + Date();
                    // console.log(msg);
                });

                server.on('connection', function(connection) {
                    let msg = 'step connection' + Date();
                    // console.log(msg);
                });

                server.on('upgrade', function(req, socket, head) {
                    let msg = 'step upgrade' + Date();
                    // console.log(msg);
                });

                server.listen(9902);
                // console.log('http server listen 9902');
            };

            let runClient = function() {
                let postData = JSON.stringify({
                    'msg': 'Hello World!',
                });

                let options = {
                    hostname: '127.0.0.1',
                    port: 9902,
                    path: '/course/introduction/1002916005.htm?utm_source=163.com&utm_medium=web_studycolumn&utm_campai',
                    // path: '/index.html?page=12',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData),
                    },
                };

                let req = http.request(options, (res) => {
                    // console.log(`STATUS: ${res.statusCode}`);
                    // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        // console.log(`BODY: ${chunk}`);
                    });
                    res.on('end', () => {
                        // console.log('No more data in response.');
                    });
                });

                req.on('error', (e) => {
                    // console.log(`problem with request: ${e.message}`);
                });

                req.write(postData);
                req.end();
            };

            runServer();

            setTimeout(runClient, 1000, 1000);
        });
    });
});
