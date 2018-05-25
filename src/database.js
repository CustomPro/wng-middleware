import Sequelize from 'sequelize'
const db = {
  name: process.env.DB_NAME || 'user-management',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
}

const settings = {
  host: process.env.DB_HOST || '127.0.0.1'
}


//if (process.env.NODE_ENV !== 'production') {
  settings.dialect = 'sqlite'
  settings.storage = './database.sqlite'
//}


const sequelize = new Sequelize(db.name, db.user, db.password, settings)
sequelize.sync()

export const Account = sequelize.define('account', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  secretPhrase: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  accountRS: {
    type: Sequelize.STRING,
    allowNull: false
  },
  token: {
    type: Sequelize.STRING,
    allowNull: true
  }
})

export const AccountVerificationApplication =
  sequelize.define('account_verification_application', {
    accountRS: {
      type: Sequelize.STRING,
      allowNull: false
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    comments: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true
    },
    files: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  })

export const Voucher =
  sequelize.define('voucher', {
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    recipient: {
      type: Sequelize.STRING,
      allowNull: true
    },
    expiration: {
      type: Sequelize.DATE,
      allowNull: true
    },
    createdBy: {
      type: Sequelize.STRING,
      allowNull: false
    },
    redeemed: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    redeemedBy: {
      type: Sequelize.STRING,
      allowNull: true
    }
  })

export const BitcoinDeposits = sequelize.define('bitcoin_deposits', {
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  accountRS: {
    type: Sequelize.STRING,
    allowNull: true
  },
  active: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  index: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true
  }
})

export const BitcoinTransaction = sequelize.define('bitcoin_transactions', {
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: false
  },
  accountRS: {
    type: Sequelize.STRING,
    allowNull: true
  },
  bitcoinTransaction: {
    type: Sequelize.STRING,
    allowNull: false
  },
  assetTransaction: {
    type: Sequelize.STRING,
    allowNull: true
  },
  amount: {
    type: Sequelize.STRING,
    allowNull: true
  }
})
