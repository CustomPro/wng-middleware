'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newBitcoinTransaction = exports.findAccountRS = exports.storeTransactions = exports.findOneDeposit = exports.findBitcoinTransaction = exports.createBitcoinWebhook = exports.findOrCreateBitcoinAddress = exports.findLatestIndex = exports.findBitcoinAddress = exports.deriveBitcoinAddress = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _bitcoinjsLib = require('bitcoinjs-lib');

var _bitcoinjsLib2 = _interopRequireDefault(_bitcoinjsLib);

var _blockcypher = require('blockcypher');

var _blockcypher2 = _interopRequireDefault(_blockcypher);

var _database = require('../database');

var _config = require('../../config.json');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var xpub = _config.bitcoin.xpub,
    blockcypherToken = _config.bitcoin.blockcypherToken,
    urlSecret = _config.bitcoin.urlSecret,
    minimumDepositSatoshis = _config.bitcoin.minimumDepositSatoshis,
    bitcoinCallbackURL = _config.bitcoin.bitcoinCallbackURL,
    bitcoinAssetId = _config.bitcoin.bitcoinAssetId;

var blockcypherAPI = new _blockcypher2.default('btc', 'main', blockcypherToken);
var node = _bitcoinjsLib2.default.HDNode.fromBase58(xpub);

// create bitcoin address based on index
var deriveBitcoinAddress = exports.deriveBitcoinAddress = function deriveBitcoinAddress(index) {
  var address = node.derivePath('0/' + index).getAddress();
  return address;
};

// check if accountRS already BTC deposit address
var findBitcoinAddress = exports.findBitcoinAddress = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(accountRS) {
    var result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _database.BitcoinDeposits.findOne({
              where: {
                accountRS: accountRS,
                active: true
              }
            });

          case 2:
            result = _context.sent;

            if (result) {
              _context.next = 5;
              break;
            }

            return _context.abrupt('return', null);

          case 5:
            return _context.abrupt('return', result.dataValues.address);

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function findBitcoinAddress(_x) {
    return _ref.apply(this, arguments);
  };
}();

// find the last index of the bitcoin addresses
var findLatestIndex = exports.findLatestIndex = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    var result;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _database.BitcoinDeposits.findOne({
              order: [['createdAt', 'DESC']]
            });

          case 2:
            result = _context2.sent;

            if (result) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt('return', 0);

          case 5:
            return _context2.abrupt('return', result.dataValues.index + 1);

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function findLatestIndex() {
    return _ref2.apply(this, arguments);
  };
}();

// koa endpoint to create or return a bitcoinaddress
var findOrCreateBitcoinAddress = exports.findOrCreateBitcoinAddress = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx) {
    var accountRS, depositAddress, index, result, createWebhookResult;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            accountRS = ctx.params.accountRS;
            _context3.next = 3;
            return findBitcoinAddress(accountRS);

          case 3:
            depositAddress = _context3.sent;

            if (depositAddress) {
              _context3.next = 17;
              break;
            }

            _context3.next = 7;
            return findLatestIndex();

          case 7:
            index = _context3.sent;
            _context3.next = 10;
            return _database.BitcoinDeposits.create({
              address: deriveBitcoinAddress(index),
              active: true,
              accountRS: accountRS,
              index: index
            });

          case 10:
            result = _context3.sent;


            depositAddress = result.dataValues.address;

            _context3.next = 14;
            return createBitcoinWebhook(depositAddress);

          case 14:
            createWebhookResult = _context3.sent;

            if (createWebhookResult) {
              _context3.next = 17;
              break;
            }

            throw Error('Error creating webhook');

          case 17:

            ctx.body = {
              success: true,
              depositAddress: depositAddress
            };

          case 18:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function findOrCreateBitcoinAddress(_x2) {
    return _ref3.apply(this, arguments);
  };
}();

// register blockcypher webhook
var createBitcoinWebhook = exports.createBitcoinWebhook = function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(address) {
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt('return', new _promise2.default(function (resolve, reject) {
              var event = {
                event: 'confirmed-tx',
                url: bitcoinCallbackURL + '?secret=' + urlSecret + '&address=' + address,
                confirmations: 1,
                address: address
              };

              blockcypherAPI.createHook(event, function (err, result) {
                if (err) {
                  return reject(err);
                }

                return resolve(result);
              });
            }));

          case 1:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function createBitcoinWebhook(_x3) {
    return _ref4.apply(this, arguments);
  };
}();

var findBitcoinTransaction = exports.findBitcoinTransaction = function () {
  var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(hash) {
    var result;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _database.BitcoinTransaction.findOne({
              where: {
                bitcoinTransaction: hash
              }
            });

          case 2:
            result = _context5.sent;

            if (result) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt('return', null);

          case 5:
            return _context5.abrupt('return', result.dataValues);

          case 6:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function findBitcoinTransaction(_x4) {
    return _ref5.apply(this, arguments);
  };
}();

var findOneDeposit = exports.findOneDeposit = function () {
  var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(accountRS) {
    var result;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _database.BitcoinTransaction.findOne({
              where: {
                accountRS: accountRS,
                amount: {
                  $gte: 250000
                }
              }
            });

          case 2:
            result = _context6.sent;

            if (result) {
              _context6.next = 5;
              break;
            }

            return _context6.abrupt('return', null);

          case 5:
            return _context6.abrupt('return', result.dataValues);

          case 6:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function findOneDeposit(_x5) {
    return _ref6.apply(this, arguments);
  };
}();

var storeTransactions = exports.storeTransactions = function () {
  var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(address, accountRS, bitcoinTransaction, assetTransaction, amount) {
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            return _context7.abrupt('return', _database.BitcoinTransaction.create({
              address: address,
              accountRS: accountRS,
              bitcoinTransaction: bitcoinTransaction,
              assetTransaction: assetTransaction,
              amount: amount
            }));

          case 1:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function storeTransactions(_x6, _x7, _x8, _x9, _x10) {
    return _ref7.apply(this, arguments);
  };
}();

var findAccountRS = exports.findAccountRS = function () {
  var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(bitcoinAddress) {
    var result;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _database.BitcoinDeposits.findOne({
              where: {
                address: bitcoinAddress
              }
            });

          case 2:
            result = _context8.sent;

            if (result) {
              _context8.next = 5;
              break;
            }

            return _context8.abrupt('return', null);

          case 5:
            return _context8.abrupt('return', result.dataValues.accountRS);

          case 6:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  }));

  return function findAccountRS(_x11) {
    return _ref8.apply(this, arguments);
  };
}();

// create callback for blockcypher
var newBitcoinTransaction = exports.newBitcoinTransaction = function () {
  var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(ctx) {
    var _ctx$query, address, secret, _ctx$body, outputs, confirmations, hash, doubleSpend, quantityQNT, bitcoinTransaction, accountRS, data, result, foundDeposit, storeResult;

    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _ctx$query = ctx.query, address = _ctx$query.address, secret = _ctx$query.secret;

            if (!(secret !== urlSecret)) {
              _context9.next = 3;
              break;
            }

            throw Error('Secret not matching');

          case 3:
            _ctx$body = ctx.body, outputs = _ctx$body.outputs, confirmations = _ctx$body.confirmations, hash = _ctx$body.hash;
            doubleSpend = ctx.body.doubleSpend;

            if (!(confirmations <= 0)) {
              _context9.next = 7;
              break;
            }

            throw Error('Not enough confirmations');

          case 7:
            if (!doubleSpend) {
              _context9.next = 9;
              break;
            }

            throw Error('Double spend');

          case 9:
            quantityQNT = 0;


            outputs.forEach(function (output) {
              if (output.addresses[0] === address) {
                quantityQNT = output.value;
                if (quantityQNT < minimumDepositSatoshis) {
                  throw Error('Minimum deposit not reached');
                }
              }
            });

            if (quantityQNT) {
              _context9.next = 13;
              break;
            }

            throw Error('Transaction not found');

          case 13:
            _context9.next = 15;
            return findBitcoinTransaction(hash);

          case 15:
            bitcoinTransaction = _context9.sent;

            if (bitcoinTransaction) {
              _context9.next = 41;
              break;
            }

            _context9.next = 19;
            return findAccountRS(address);

          case 19:
            accountRS = _context9.sent;
            data = {
              recipient: accountRS,
              asset: bitcoinAssetId,
              quantityQNT: quantityQNT
            };
            _context9.next = 23;
            return (0, _utils.transferAsset)(data);

          case 23:
            result = _context9.sent;

            if (!(result && result.data && !result.data.errorCode)) {
              _context9.next = 38;
              break;
            }

            _context9.next = 27;
            return findOneDeposit(accountRS);

          case 27:
            foundDeposit = _context9.sent;

            if (!foundDeposit && quantityQNT >= 250000) {
              (0, _utils.sendMoney)({
                recipient: accountRS,
                value: _config.minimumFee * 10
              });
            }

            _context9.next = 31;
            return storeTransactions(address, accountRS, hash, result.data.transaction, quantityQNT);

          case 31:
            storeResult = _context9.sent;

            if (storeResult) {
              _context9.next = 34;
              break;
            }

            throw Error('Could not store transactions');

          case 34:
            ctx.body = {
              success: true
            };
            return _context9.abrupt('return');

          case 38:
            throw Error('Couldn\'t sent out the assetBTC');

          case 39:
            _context9.next = 42;
            break;

          case 41:
            throw Error('Bitcoin transaction already processed');

          case 42:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  }));

  return function newBitcoinTransaction(_x12) {
    return _ref9.apply(this, arguments);
  };
}();