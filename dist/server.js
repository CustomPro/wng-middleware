'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _koaCors = require('koa-cors');

var _koaCors2 = _interopRequireDefault(_koaCors);

var _api = require('./api');

var _voucher = require('./api/voucher');

var _bitcoin = require('./api/bitcoin');

var _admin = require('./admin');

var _user = require('./user');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-polyfill');


var app = new _koa2.default();
var router = new _koaRouter2.default();

app.use((0, _koaCors2.default)());
app.use((0, _koaBodyparser2.default)());
app.use(function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ctx.body = ctx.request.body;
            _context.next = 3;
            return next();

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
app.use(function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return next();

          case 3:
            _context2.next = 10;
            break;

          case 5:
            _context2.prev = 5;
            _context2.t0 = _context2['catch'](0);

            console.log('err', _context2.t0);
            ctx.body = {
              status: 'error',
              errorDescription: _context2.t0.message
            };
            ctx.status = _context2.t0.status || 500;

          case 10:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[0, 5]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

app.use(router.routes());
app.use(router.allowedMethods());

app.use(function (ctx, next) {
  ctx.body = {
    status: 'error',
    errorDescription: 'Route not found'
  };
});

router.post('/register', _api.register);
router.get('/account', _api.getAccount);
router.get('/is-admin', _admin.isAdmin, function (ctx) {
  ctx.body = {
    status: 'success',
    isAdmin: true
  };
});
router.get('/accounts', _admin.isAdmin, _api.getAccounts);
router.get('/constants', _api.getConstants);

// verification routes
router.post('/verification', _api.createVerification);
router.post('/admin/verification/:id/status', _admin.isAdminPost, _api.updateAccountStatus);
router.get('/verification/:accountRS', _user.isAccountRS, _api.hasVerification);
router.get('/admin/verifications', _admin.isAdmin, _api.getVerifications);
router.get('/verification/img/:accountRS/:file', _admin.isAdmin, _api.getEncryptedVerification);

// voucher routes
router.post('/admin/voucher', _admin.isAdminPost, _voucher.createVoucher);
router.get('/admin/vouchers', _admin.isAdmin, _voucher.getVouchers);
router.post('/voucher', _user.isAccountRS, _voucher.getSingleVoucher);
router.put('/voucher', _user.isAccountRS, _voucher.redeemVoucher);

// bitcoin routes
router.get('/bitcoin/deposit/:accountRS', _user.isAccountRS, _bitcoin.findOrCreateBitcoinAddress);
router.post('/bitcoin/new-tx', _bitcoin.newBitcoinTransaction);

var port = process.env.PORT || 3001;
app.listen(port);