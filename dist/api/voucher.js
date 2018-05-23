'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.redeemVoucher = exports.getSingleVoucher = exports.getVouchers = exports.createVoucher = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _database = require('../database');

var _utils = require('../utils');

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createVoucher = exports.createVoucher = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx) {
    var _ctx$body, multiple, value, code, expiration, recipient, createdBy, amount, voucherData, vouchersArray, i, generatedVoucher;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _ctx$body = ctx.body, multiple = _ctx$body.multiple, value = _ctx$body.value, code = _ctx$body.code, expiration = _ctx$body.expiration, recipient = _ctx$body.recipient, createdBy = _ctx$body.createdBy, amount = _ctx$body.amount;
            voucherData = { value: value, createdBy: createdBy, expiration: expiration, recipient: recipient };

            if (!(multiple === 'true' || multiple === true)) {
              _context3.next = 9;
              break;
            }

            vouchersArray = [];

            for (i = 0; i < parseInt(amount); i++) {
              generatedVoucher = {
                value: value,
                code: _shortid2.default.generate(),
                createdBy: createdBy,
                expiration: expiration,
                recipient: recipient
              };

              vouchersArray.push(generatedVoucher);
            }
            _context3.next = 7;
            return _database.Voucher.bulkCreate(vouchersArray).then(function () {
              var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(result) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        ctx.body = result;

                      case 1:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 7:
            _context3.next = 12;
            break;

          case 9:
            voucherData.code = code;
            _context3.next = 12;
            return _database.Voucher.create(voucherData).then(function () {
              var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(result) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        ctx.body = result;

                      case 1:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, undefined);
              }));

              return function (_x3) {
                return _ref3.apply(this, arguments);
              };
            }());

          case 12:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function createVoucher(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getVouchers = exports.getVouchers = function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(ctx) {
    var _ctx$query, limit, offset, query;

    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _ctx$query = ctx.query, limit = _ctx$query.limit, offset = _ctx$query.offset;

            if (!limit || limit <= 0) limit = 10;
            if (!offset || offset < 0) offset = 0;

            limit = Number(limit);
            offset = Number(offset);

            query = {
              where: {
                $or: [{
                  expiration: {
                    $gte: new Date()
                  }
                }, {
                  expiration: {
                    $eq: null
                  }
                }]
              },
              limit: limit,
              offset: offset,
              order: 'createdAt DESC'
            };
            _context5.next = 8;
            return _database.Voucher.findAndCountAll(query).then(function () {
              var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(result) {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        ctx.body = {
                          status: 'success',
                          vouchers: result.rows,
                          recordsTotal: result.count
                        };

                      case 1:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, undefined);
              }));

              return function (_x5) {
                return _ref5.apply(this, arguments);
              };
            }());

          case 8:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function getVouchers(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

var getSingleVoucher = exports.getSingleVoucher = function () {
  var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(ctx) {
    var _ctx$body2, code, accountRS;

    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _ctx$body2 = ctx.body, code = _ctx$body2.code, accountRS = _ctx$body2.accountRS;
            _context7.next = 3;
            return _database.Voucher.findOne({
              where: {
                code: code
              }
            }).then(function () {
              var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(result) {
                var error, filteredVoucher;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        if (!result) {
                          ctx.body = {
                            status: 'error',
                            errorDescription: 'No voucher found',
                            errorMessage: 'none'
                          };
                        } else {
                          error = void 0;

                          if (result.recipient !== null && result.recipient !== accountRS) {
                            error = true;
                            errorBody = {
                              status: 'error',
                              errorDescription: 'You do not have permission to redeem this voucher',
                              errorMessage: 'recipient'
                            };
                          }
                          filteredVoucher = {
                            code: result.code,
                            value: result.value,
                            expiration: result.expiration
                          };

                          if (error !== true) {
                            ctx.body = {
                              status: 'success',
                              voucher: filteredVoucher
                            };
                          } else {
                            ctx.body = errorBody;
                          }
                        }

                      case 1:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee6, undefined);
              }));

              return function (_x7) {
                return _ref7.apply(this, arguments);
              };
            }());

          case 3:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function getSingleVoucher(_x6) {
    return _ref6.apply(this, arguments);
  };
}();

var redeemVoucher = exports.redeemVoucher = function () {
  var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(ctx) {
    var _ctx$body3, code, accountRS;

    return _regenerator2.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _ctx$body3 = ctx.body, code = _ctx$body3.code, accountRS = _ctx$body3.accountRS;
            _context11.next = 3;
            return _database.Voucher.findOne({
              where: {
                code: code
              }
            }).then(function () {
              var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(result) {
                var valid, data;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        valid = (0, _utils.validateVoucher)(result, accountRS);

                        if (!(valid.error === false)) {
                          _context10.next = 7;
                          break;
                        }

                        data = { value: result.value, recipient: accountRS };
                        _context10.next = 5;
                        return (0, _utils.sendMoney)(data).then(function () {
                          var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(response) {
                            return _regenerator2.default.wrap(function _callee9$(_context9) {
                              while (1) {
                                switch (_context9.prev = _context9.next) {
                                  case 0:
                                    _context9.next = 2;
                                    return _database.Voucher.update({ redeemed: true,
                                      redeemedBy: accountRS }, { where: { code: code } }).then(function () {
                                      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(dbResponse) {
                                        return _regenerator2.default.wrap(function _callee8$(_context8) {
                                          while (1) {
                                            switch (_context8.prev = _context8.next) {
                                              case 0:
                                                ctx.body = {
                                                  'status': 'success',
                                                  voucher: dbResponse
                                                };

                                              case 1:
                                              case 'end':
                                                return _context8.stop();
                                            }
                                          }
                                        }, _callee8, undefined);
                                      }));

                                      return function (_x11) {
                                        return _ref11.apply(this, arguments);
                                      };
                                    }());

                                  case 2:
                                  case 'end':
                                    return _context9.stop();
                                }
                              }
                            }, _callee9, undefined);
                          }));

                          return function (_x10) {
                            return _ref10.apply(this, arguments);
                          };
                        }());

                      case 5:
                        _context10.next = 8;
                        break;

                      case 7:
                        ctx.body = valid.errorBody;

                      case 8:
                      case 'end':
                        return _context10.stop();
                    }
                  }
                }, _callee10, undefined);
              }));

              return function (_x9) {
                return _ref9.apply(this, arguments);
              };
            }());

          case 3:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, undefined);
  }));

  return function redeemVoucher(_x8) {
    return _ref8.apply(this, arguments);
  };
}();