'use strict';

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {'default': obj};
}

let _react = require('react');

let _react2 = _interopRequireDefault(_react);

let _reactDom = require('react-dom');

let _reactDom2 = _interopRequireDefault(_reactDom);

let _app = require('./app');

let _app2 = _interopRequireDefault(_app);

_reactDom2['default'].render(_react2['default'].createElement(_app2['default'], {items: window.APP_PROPS.items}), document.getElementById('content'));
