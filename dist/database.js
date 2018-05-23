'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BitcoinTransaction = exports.BitcoinDeposits = exports.Voucher = exports.AccountVerificationApplication = exports.Account = undefined;

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = {
  name: process.env.DB_NAME || 'user-management',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

var settings = {
  host: process.env.DB_HOST || '127.0.0.1'
};

if (process.env.NODE_ENV !== 'production') {
  settings.dialect = 'sqlite';
  settings.storage = './database.sqlite';
}

var sequelize = new _sequelize2.default(db.name, db.user, db.password, settings);
sequelize.sync();

var Account = exports.Account = sequelize.define('account', {
  username: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    unique: true
  },
  secretPhrase: {
    type: _sequelize2.default.TEXT,
    allowNull: false
  },
  accountRS: {
    type: _sequelize2.default.STRING,
    allowNull: false
  }
});

var AccountVerificationApplication = exports.AccountVerificationApplication = sequelize.define('account_verification_application', {
  accountRS: {
    type: _sequelize2.default.STRING,
    allowNull: false
  },
  full_name: {
    type: _sequelize2.default.STRING,
    allowNull: false
  },
  address: {
    type: _sequelize2.default.TEXT,
    allowNull: false
  },
  comments: {
    type: _sequelize2.default.TEXT,
    allowNull: true
  },
  status: {
    type: _sequelize2.default.STRING,
    allowNull: true
  },
  files: {
    type: _sequelize2.default.TEXT,
    allowNull: true
  }
});

var Voucher = exports.Voucher = sequelize.define('voucher', {
  code: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: _sequelize2.default.FLOAT,
    allowNull: false
  },
  recipient: {
    type: _sequelize2.default.STRING,
    allowNull: true
  },
  expiration: {
    type: _sequelize2.default.DATE,
    allowNull: true
  },
  createdBy: {
    type: _sequelize2.default.STRING,
    allowNull: false
  },
  redeemed: {
    type: _sequelize2.default.BOOLEAN,
    allowNull: true
  },
  redeemedBy: {
    type: _sequelize2.default.STRING,
    allowNull: true
  }
});

var BitcoinDeposits = exports.BitcoinDeposits = sequelize.define('bitcoin_deposits', {
  address: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    unique: true
  },
  accountRS: {
    type: _sequelize2.default.STRING,
    allowNull: true
  },
  active: {
    type: _sequelize2.default.BOOLEAN,
    allowNull: false
  },
  index: {
    type: _sequelize2.default.INTEGER,
    allowNull: false,
    unique: true
  }
});

var BitcoinTransaction = exports.BitcoinTransaction = sequelize.define('bitcoin_transactions', {
  address: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    unique: false
  },
  accountRS: {
    type: _sequelize2.default.STRING,
    allowNull: true
  },
  bitcoinTransaction: {
    type: _sequelize2.default.STRING,
    allowNull: false
  },
  assetTransaction: {
    type: _sequelize2.default.STRING,
    allowNull: true
  },
  amount: {
    type: _sequelize2.default.STRING,
    allowNull: true
  }
});