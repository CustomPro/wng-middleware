'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAdminPost = exports.isAdmin = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

var _nxtCrypto = require('nxt-crypto');

var _nxtCrypto2 = _interopRequireDefault(_nxtCrypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseToken = _nxtCrypto2.default.parseToken;
var adminPublicKeys = _config2.default.adminPublicKeys;
var isAdmin = exports.isAdmin = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
    var token, parsedToken;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            token = ctx.query.token;
            _context.prev = 1;

            if (!(!token || token.length !== 160)) {
              _context.next = 4;
              break;
            }

            throw Error();

          case 4:
            parsedToken = parseToken(token, 'admin');

            if (!(parsedToken.isValid && adminPublicKeys.includes(parsedToken.publicKey))) {
              _context.next = 9;
              break;
            }

            _context.next = 8;
            return next();

          case 8:
            return _context.abrupt('return', _context.sent);

          case 9:
            throw Error();

          case 12:
            _context.prev = 12;
            _context.t0 = _context['catch'](1);

            ctx.body = {
              status: 'error',
              errorDescription: 'Invalid token',
              errorMessage: 'token'
            };

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[1, 12]]);
  }));

  return function isAdmin(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var isAdminPost = exports.isAdminPost = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
    var token, parsedToken;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            token = ctx.body.token;
            _context2.prev = 1;

            if (!(!token || token.length !== 160)) {
              _context2.next = 4;
              break;
            }

            throw Error();

          case 4:
            parsedToken = parseToken(token, 'admin');

            if (!(parsedToken.isValid && adminPublicKeys.includes(parsedToken.publicKey))) {
              _context2.next = 9;
              break;
            }

            _context2.next = 8;
            return next();

          case 8:
            return _context2.abrupt('return', _context2.sent);

          case 9:
            throw Error();

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2['catch'](1);

            ctx.body = {
              status: 'error',
              errorDescription: 'Invalid token'
            };

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[1, 12]]);
  }));

  return function isAdminPost(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();