'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateAccountStatus = exports.getVerifications = exports.hasVerification = exports.getEncryptedVerification = exports.createVerification = exports.getConstants = exports.getAccounts = exports.getAccount = exports.register = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _database = require('./database');

var _asyncBusboy = require('async-busboy');

var _asyncBusboy2 = _interopRequireDefault(_asyncBusboy);

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var awsID = _config2.default.awsID,
    awsSecret = _config2.default.awsSecret,
    awsBucket = _config2.default.awsBucket,
    awsMasterKey = _config2.default.awsMasterKey;

var aesKey = Buffer.alloc(32, awsMasterKey);


var S3Client = new _awsSdk2.default.S3({
  accessKeyId: awsID,
  secretAccessKey: awsSecret,
  maxRetries: 3
});

var register = exports.register = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _database.Account.create((0, _extends3.default)({}, ctx.body)).then(function () {
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

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function register(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getAccount = exports.getAccount = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ctx) {
    var _ctx$query, username, email;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _ctx$query = ctx.query, username = _ctx$query.username, email = _ctx$query.email;
            _context4.next = 3;
            return _database.Account.findOne({
              where: {
                username: username,
                email: email
              }
            }).then(function () {
              var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(result) {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        if (!result) {
                          ctx.body = {
                            status: 'error',
                            errorDescription: 'User not found'
                          };
                        } else {
                          ctx.body = {
                            status: 'success',
                            account: result
                          };
                        }

                      case 1:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, undefined);
              }));

              return function (_x4) {
                return _ref4.apply(this, arguments);
              };
            }());

          case 3:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function getAccount(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var getAccounts = exports.getAccounts = function () {
  var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(ctx) {
    var _ctx$query2, limit, offset, search, query;

    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _ctx$query2 = ctx.query, limit = _ctx$query2.limit, offset = _ctx$query2.offset, search = _ctx$query2.search;

            if (!limit || limit <= 0) limit = 10;
            if (!offset || offset < 0) offset = 0;

            limit = Number(limit);
            offset = Number(offset);

            query = {
              limit: limit,
              offset: offset,
              order: 'createdAt DESC'
            };


            if (search) {
              query.where = {
                username: {
                  $like: search + '%'
                }
              };
              query.where = {
                $or: [{
                  username: {
                    $like: search + '%'
                  }
                }, {
                  email: {
                    $like: search + '%'
                  }
                }, {
                  accountRS: {
                    $like: search + '%'
                  }
                }]
              };
            }

            _context6.next = 9;
            return _database.Account.findAndCountAll(query).then(function () {
              var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(result) {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        ctx.body = {
                          status: 'success',
                          accounts: result.rows,
                          recordsTotal: result.count
                        };

                      case 1:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, undefined);
              }));

              return function (_x6) {
                return _ref6.apply(this, arguments);
              };
            }());

          case 9:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function getAccounts(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

var getConstants = exports.getConstants = function () {
  var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(ctx) {
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            ctx.body = {
              walletVersion: '0.8.0'
            };

          case 1:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function getConstants(_x7) {
    return _ref7.apply(this, arguments);
  };
}();

var createVerification = exports.createVerification = function () {
  var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(ctx) {
    var _ref9, files, fields, accountRS, filePath, filesArray;

    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return (0, _asyncBusboy2.default)(ctx.req);

          case 2:
            _ref9 = _context9.sent;
            files = _ref9.files;
            fields = _ref9.fields;
            accountRS = void 0;
            filePath = void 0;
            filesArray = [];

            if (fields.accountRS) {
              accountRS = fields.accountRS;
            }
            files.map(function (file) {
              var name = file.fieldname;
              filePath = accountRS + '/' + name;
              var params = {
                Bucket: awsBucket,
                Key: filePath,
                Body: file,
                SSECustomerAlgorithm: 'AES256',
                SSECustomerKey: aesKey,
                Metadata: {
                  Account: accountRS,
                  MimeType: file.mimeType
                }
              };
              filesArray.push(name);
              S3Client.upload(params, {}, function (err, data) {
                console.log(err, data);
              });
            });
            fields.files = filesArray.join();
            _context9.next = 13;
            return _database.AccountVerificationApplication.create(fields, {}).then(function () {
              var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(result) {
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        ctx.body = result;

                      case 1:
                      case 'end':
                        return _context8.stop();
                    }
                  }
                }, _callee8, undefined);
              }));

              return function (_x9) {
                return _ref10.apply(this, arguments);
              };
            }());

          case 13:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  }));

  return function createVerification(_x8) {
    return _ref8.apply(this, arguments);
  };
}();

var getEncryptedVerification = exports.getEncryptedVerification = function () {
  var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(ctx) {
    var _ctx$params, accountRS, file, filePath, params, getObjectPromise;

    return _regenerator2.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _ctx$params = ctx.params, accountRS = _ctx$params.accountRS, file = _ctx$params.file;
            filePath = accountRS + '/' + file;
            params = {
              Bucket: awsBucket,
              Key: filePath,
              SSECustomerAlgorithm: 'AES256',
              SSECustomerKey: aesKey
            };
            getObjectPromise = S3Client.getObject(params).promise();
            _context10.next = 6;
            return getObjectPromise.then(function (data) {
              if (data.Metadata && data.Metadata.mimetype) {
                ctx.set('Content-Type', data.Metadata.mimetype);
              } else {
                ctx.set('Content-Type', 'application/octet-stream');
              }
              ctx.body = data.Body;
            }).catch(function (err) {
              console.log(err);
            });

          case 6:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, undefined);
  }));

  return function getEncryptedVerification(_x10) {
    return _ref11.apply(this, arguments);
  };
}();

var hasVerification = exports.hasVerification = function () {
  var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(ctx) {
    var accountRS;
    return _regenerator2.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            accountRS = ctx.params.accountRS;
            _context12.next = 3;
            return _database.AccountVerificationApplication.findOne({
              where: {
                accountRS: accountRS
              },
              order: [['createdAt', 'DESC']]
            }).then(function () {
              var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(result) {
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        if (!result) {
                          ctx.body = {
                            status: 'error',
                            errorDescription: 'No verification application found'
                          };
                        } else {
                          ctx.body = {
                            status: 'success',
                            account: result
                          };
                        }

                      case 1:
                      case 'end':
                        return _context11.stop();
                    }
                  }
                }, _callee11, undefined);
              }));

              return function (_x12) {
                return _ref13.apply(this, arguments);
              };
            }());

          case 3:
          case 'end':
            return _context12.stop();
        }
      }
    }, _callee12, undefined);
  }));

  return function hasVerification(_x11) {
    return _ref12.apply(this, arguments);
  };
}();

var getVerifications = exports.getVerifications = function () {
  var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(ctx) {
    var _ctx$query3, limit, offset, search, query;

    return _regenerator2.default.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            _ctx$query3 = ctx.query, limit = _ctx$query3.limit, offset = _ctx$query3.offset, search = _ctx$query3.search;

            if (!limit || limit <= 0) limit = 10;
            if (!offset || offset < 0) offset = 0;

            limit = Number(limit);
            offset = Number(offset);

            query = {
              limit: limit,
              offset: offset,
              order: 'createdAt DESC'
            };


            if (search) {
              query.where = {
                accountRS: {
                  $like: search + '%'
                }
              };
            }

            _context14.next = 9;
            return _database.AccountVerificationApplication.findAndCountAll(query).then(function () {
              var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(result) {
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                  while (1) {
                    switch (_context13.prev = _context13.next) {
                      case 0:
                        ctx.body = {
                          status: 'success',
                          applications: result.rows,
                          recordsTotal: result.count
                        };

                      case 1:
                      case 'end':
                        return _context13.stop();
                    }
                  }
                }, _callee13, undefined);
              }));

              return function (_x14) {
                return _ref15.apply(this, arguments);
              };
            }());

          case 9:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, undefined);
  }));

  return function getVerifications(_x13) {
    return _ref14.apply(this, arguments);
  };
}();

var updateAccountStatus = exports.updateAccountStatus = function () {
  var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(ctx) {
    var id, status;
    return _regenerator2.default.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            id = ctx.params.id;
            status = ctx.body.status;
            _context16.next = 4;
            return _database.AccountVerificationApplication.update({ status: status }, { where: { id: id } }).then(function () {
              var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(result) {
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                  while (1) {
                    switch (_context15.prev = _context15.next) {
                      case 0:
                        ctx.body = {
                          'status': 'success',
                          result: result
                        };

                      case 1:
                      case 'end':
                        return _context15.stop();
                    }
                  }
                }, _callee15, undefined);
              }));

              return function (_x16) {
                return _ref17.apply(this, arguments);
              };
            }());

          case 4:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, undefined);
  }));

  return function updateAccountStatus(_x15) {
    return _ref16.apply(this, arguments);
  };
}();