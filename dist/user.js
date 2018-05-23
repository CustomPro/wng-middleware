'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAccountRS = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _nxtCrypto = require('nxt-crypto');

var _nxtCrypto2 = _interopRequireDefault(_nxtCrypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseToken = _nxtCrypto2.default.parseToken,
    getAccountRS = _nxtCrypto2.default.getAccountRS;
var isAccountRS = exports.isAccountRS = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
    var accountRS, token, parsedToken;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            accountRS = ctx.query.accountRS || ctx.params.accountRS || ctx.body.accountRS;
            token = ctx.query.token || ctx.params.token || ctx.body.token;
            _context.prev = 2;

            if (!(!token || token.length !== 160)) {
              _context.next = 5;
              break;
            }

            throw Error();

          case 5:
            parsedToken = parseToken(token, accountRS);

            if (!(parsedToken.isValid && getAccountRS(parsedToken.publicKey, accountRS.slice(0, 3)) === accountRS)) {
              _context.next = 10;
              break;
            }

            _context.next = 9;
            return next();

          case 9:
            return _context.abrupt('return', _context.sent);

          case 10:
            throw Error();

          case 13:
            _context.prev = 13;
            _context.t0 = _context['catch'](2);

            ctx.body = {
              status: 'error',
              errorDescription: 'Invalid token'
            };

          case 16:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 13]]);
  }));

  return function isAccountRS(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();