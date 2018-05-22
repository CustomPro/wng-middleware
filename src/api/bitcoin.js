import bitcoinjs from 'bitcoinjs-lib'
import Blockcypher from 'blockcypher'
import { BitcoinDeposits, BitcoinTransaction } from '../database'
import { bitcoin as bitcoinConfig, minimumFee } from '../../config.json'
import { transferAsset, sendMoney } from '../utils'
const {
    xpub,
    blockcypherToken,
    urlSecret,
    minimumDepositSatoshis,
    bitcoinCallbackURL,
    bitcoinAssetId
} = bitcoinConfig
const blockcypherAPI = new Blockcypher('btc', 'main', blockcypherToken)
const node = bitcoinjs.HDNode.fromBase58(xpub)

// create bitcoin address based on index
export const deriveBitcoinAddress = (index) => {
  const address = node.derivePath(`0/${index}`).getAddress()
  return address
}

// check if accountRS already BTC deposit address
export const findBitcoinAddress = async (accountRS) => {
  const result = await BitcoinDeposits.findOne({
    where: {
      accountRS,
      active: true
    }
  })

  if (!result) {
    return null
  }

  return result.dataValues.address
}

// find the last index of the bitcoin addresses
export const findLatestIndex = async () => {
  const result = await BitcoinDeposits.findOne({
    order: [
      ['createdAt', 'DESC']
    ]
  })

  if (!result) {
    return 0
  }

  return result.dataValues.index + 1
}

// koa endpoint to create or return a bitcoinaddress
export const findOrCreateBitcoinAddress = async (ctx) => {
  const { accountRS } = ctx.params
  let depositAddress = await findBitcoinAddress(accountRS)

  if (!depositAddress) {
    const index = await findLatestIndex()
    const result = await BitcoinDeposits.create({
      address: deriveBitcoinAddress(index),
      active: true,
      accountRS,
      index
    })

    depositAddress = result.dataValues.address

    const createWebhookResult = await createBitcoinWebhook(depositAddress)

    if (!createWebhookResult) {
      throw Error('Error creating webhook')
    }
  }

  ctx.body = {
    success: true,
    depositAddress
  }
}

// register blockcypher webhook
export const createBitcoinWebhook = async (address) => {
  return new Promise((resolve, reject) => {
    const event = {
      event: 'confirmed-tx',
      url: `${bitcoinCallbackURL}?secret=${urlSecret}&address=${address}`,
      confirmations: 1,
      address
    }

    blockcypherAPI.createHook(event, (err, result) => {
      if (err) {
        return reject(err)
      }

      return resolve(result)
    })
  })
}

export const findBitcoinTransaction = async (hash) => {
  const result = await BitcoinTransaction.findOne({
    where: {
      bitcoinTransaction: hash
    }
  })

  if (!result) {
    return null
  }

  return result.dataValues
}

export const findOneDeposit = async (accountRS) => {
  const result = await BitcoinTransaction.findOne({
    where: {
      accountRS,
      amount: {
        $gte: 250000
      }
    }
  })

  if (!result) {
    return null
  }

  return result.dataValues
}

export const storeTransactions = async (address, accountRS, bitcoinTransaction, assetTransaction, amount) => {
  return BitcoinTransaction.create({
    address,
    accountRS,
    bitcoinTransaction,
    assetTransaction,
    amount
  })
}

export const findAccountRS = async (bitcoinAddress) => {
  const result = await BitcoinDeposits.findOne({
    where: {
      address: bitcoinAddress
    }
  })

  if (!result) {
    return null
  }

  return result.dataValues.accountRS
}

// create callback for blockcypher
export const newBitcoinTransaction = async (ctx) => {
  const { address, secret } = ctx.query

  if (secret !== urlSecret) {
    throw Error('Secret not matching')
  }

  const {
    outputs,
    confirmations,
    hash
  } = ctx.body
  const doubleSpend = ctx.body.doubleSpend

  if (confirmations <= 0) {
    throw Error('Not enough confirmations')
  }
  if (doubleSpend) {
    throw Error('Double spend')
  }
  let quantityQNT = 0

  outputs.forEach((output) => {
    if (output.addresses[0] === address) {
      quantityQNT = output.value
      if (quantityQNT < minimumDepositSatoshis) {
        throw Error('Minimum deposit not reached')
      }
    }
  })

  if (!quantityQNT) {
    throw Error('Transaction not found')
  }

  const bitcoinTransaction = await findBitcoinTransaction(hash)

  if (!bitcoinTransaction) {
    // send out asset btc
    const accountRS = await findAccountRS(address)
    const data = {
      recipient: accountRS,
      asset: bitcoinAssetId,
      quantityQNT
    }
    const result = await transferAsset(data)

    if (result && result.data && !result.data.errorCode) {
      const foundDeposit = await findOneDeposit(accountRS)
      if (!foundDeposit && quantityQNT >= 250000) {
        sendMoney({
          recipient: accountRS,
          value: (minimumFee * 10)
        })
      }

      const storeResult = await storeTransactions(address, accountRS, hash, result.data.transaction, quantityQNT)
      if (!storeResult) {
        throw Error('Could not store transactions')
      }
      ctx.body = {
        success: true
      }
      return
    } else {
      throw Error('Couldn\'t sent out the assetBTC')
    }
    // store it
  } else {
    throw Error('Bitcoin transaction already processed')
  }
}
