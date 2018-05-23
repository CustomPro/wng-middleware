'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transferAsset = exports.sendMoney = exports.validateVoucher = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.sendAxiosRequest = sendAxiosRequest;

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

var _nxtCrypto = require('nxt-crypto');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nrsUrl = _config2.default.nrsUrl,
    nrsSecretPhrase = _config2.default.nrsSecretPhrase,
    nrsSuffix = _config2.default.nrsSuffix;


// copying a bunch of utils from wallet here
function _parseData(data) {
  if (!data.secretPhrase) return data;

  if (typeof data.feeDQT === 'undefined') {
    data.feeDQT = _config2.default.minimumFee;
  }

  if (typeof data.deadline === 'undefined') {
    data.deadline = 24;
  }
  return data;
}

function _parseResult(result, textStatus, jqXHR) {
  // console.log('_parseResult', result, textStatus, jqXHR)
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result);
    } catch (e) {
      return e;
    }
  }

  return result;
}

function sendAxiosRequest(requestType, data) {
  var async = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var params = arguments[3];

  data = _parseData(data);
  // no secretphrase, we can just broadcast
  var url = nrsUrl + '/' + nrsSuffix.toLowerCase() + '?requestType=' + requestType + '&random=' + Math.random();
  if (params) {
    url = nrsUrl + '/' + nrsSuffix.toLowerCase() + '?requestType=' + requestType + '&' + params + '&random=' + Math.random();
  }
  if (!data.secretPhrase) {
    return (0, _axios2.default)({
      method: 'post',
      url: url,
      data: _qs2.default.stringify(data),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(_parseResult);
  }

  // sign transactions locally
  var secretPhrase = data.secretPhrase;
  delete data.secretPhrase;
  data.publicKey = (0, _nxtCrypto.getPublicKey)(secretPhrase);
  return (0, _axios2.default)({
    method: 'post',
    url: url,
    data: _qs2.default.stringify(data),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).then(_parseResult).then(function (result, textStatus, jqXHR) {
    // TODO: fix this
    // if (result && result.errorDescription) {
    //   return $.Deferred().reject(jqXHR, textStatus, result)
    // }
    // console.log(textStatus, jqXHR)

    try {
      var unsignedTransactionBytes = result.data.unsignedTransactionBytes;

      var signature = (0, _nxtCrypto.signBytes)(unsignedTransactionBytes, secretPhrase);
      return {
        transactionBytes: unsignedTransactionBytes.substr(0, 192) + signature + unsignedTransactionBytes.substr(320),
        prunableAttachmentJSON: (0, _stringify2.default)(result.data.transactionJSON.attachment)
      };
    } catch (e) {
      return false;
    }
  }).then(function (result) {
    return sendAxiosRequest('broadcastTransaction', result);
  });
}

var validateVoucher = exports.validateVoucher = function validateVoucher(voucher, accountRS) {
  var error = false;
  var errorBody = void 0;
  if (voucher.redeemed === false) {
    error = true;
    errorBody = {
      status: 'error',
      errorDescription: 'This voucher cannot be redeemed',
      errorMessage: 'amount'
    };
  }
  if (voucher.expiration !== null && voucher.expiration <= new Date()) {
    error = true;
    errorBody = {
      status: 'error',
      errorDescription: 'This voucher has expired',
      errorMessage: 'expired'
    };
  }
  if (voucher.recipient !== null && voucher.recipient !== accountRS) {
    error = true;
    errorBody = {
      status: 'error',
      errorDescription: 'You do not have permission to redeem this voucher',
      errorMessage: 'recipient'
    };
  }
  return { error: error, errorBody: errorBody };
};

var sendMoney = exports.sendMoney = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data) {
    var sendData, requestType;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            sendData = {
              recipient: data.recipient,
              amountDQT: data.value,
              secretPhrase: nrsSecretPhrase
            };
            requestType = 'sendMoney';
            return _context.abrupt('return', sendAxiosRequest(requestType, sendData));

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function sendMoney(_x2) {
    return _ref.apply(this, arguments);
  };
}();

var transferAsset = exports.transferAsset = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data) {
    var sendData, requestType;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            sendData = {
              recipient: data.recipient,
              quantityQNT: data.quantityQNT,
              asset: data.asset,
              secretPhrase: nrsSecretPhrase
            };
            requestType = 'transferAsset';
            return _context2.abrupt('return', sendAxiosRequest(requestType, sendData));

          case 3:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function transferAsset(_x3) {
    return _ref2.apply(this, arguments);
  };
}();