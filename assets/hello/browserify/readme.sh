#!/usr/bin/env bash

git clone https://github.com/canjs/browserify-simple-example.git browserify1 --recursive
cd browserify1
npm install
./node_modules/browserify/bin/cmd.js --debug --entry index.js --outfile dist/bundle.js
Open index.html
