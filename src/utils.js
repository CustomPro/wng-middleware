import config from '../config.json'
import { getPublicKey, signBytes } from 'nxt-crypto'
const { nrsUrl, nrsSecretPhrase, nrsSuffix } = config
import axios from 'axios'
import qs from 'qs'

// copying a bunch of utils from wallet here
function _parseData (data) {
  if (!data.secretPhrase) return data

  if (typeof data.feeDQT === 'undefined') {
    data.feeDQT = config.minimumFee
  }

  if (typeof data.deadline === 'undefined') {
    data.deadline = 24
  }
  return data
}

function _parseResult (result, textStatus, jqXHR) {
  // console.log('_parseResult', result, textStatus, jqXHR)
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result)
    } catch (e) {
      return e
    }
  }

  return result
}

export function sendAxiosRequest (requestType, data, async = true, params) {
  data = _parseData(data)
  // no secretphrase, we can just broadcast
  let url = `${nrsUrl}/${nrsSuffix.toLowerCase()}?requestType=${requestType}&random=${Math.random()}`
  if (params) {
    url = `${nrsUrl}/${nrsSuffix.toLowerCase()}?requestType=${requestType}&${params}&random=${Math.random()}`
  }
  if (!data.secretPhrase) {
    return axios({
      method: 'post',
      url,
      data: qs.stringify(data),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(_parseResult)
  }

  // sign transactions locally
  let secretPhrase = data.secretPhrase
  delete data.secretPhrase
  data.publicKey = getPublicKey(secretPhrase)
  return axios({
    method: 'post',
    url,
    data: qs.stringify(data),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  })
  .then(_parseResult)
  .then(function (result, textStatus, jqXHR) {
    // TODO: fix this
    // if (result && result.errorDescription) {
    //   return $.Deferred().reject(jqXHR, textStatus, result)
    // }
    // console.log(textStatus, jqXHR)

    try {
      const { unsignedTransactionBytes } = result.data
      const signature = signBytes(unsignedTransactionBytes, secretPhrase)
      return {
        transactionBytes: unsignedTransactionBytes.substr(0, 192) + signature + unsignedTransactionBytes.substr(320),
        prunableAttachmentJSON: JSON.stringify(result.data.transactionJSON.attachment)
      }
    } catch (e) {
      return false
    }
  })
  .then((result) => {
    return sendAxiosRequest('broadcastTransaction', result)
  })
}

export const validateVoucher = (voucher, accountRS) => {
  let error = false
  let errorBody
  if (voucher.redeemed === false) {
    error = true
    errorBody = {
      status: 'error',
      errorDescription: 'This voucher cannot be redeemed',
      errorMessage: 'amount'
    }
  }
  if (voucher.expiration !== null && voucher.expiration <= new Date()) {
    error = true
    errorBody = {
      status: 'error',
      errorDescription: 'This voucher has expired',
      errorMessage: 'expired'
    }
  }
  if (voucher.recipient !== null && voucher.recipient !== accountRS) {
    error = true
    errorBody = {
      status: 'error',
      errorDescription: 'You do not have permission to redeem this voucher',
      errorMessage: 'recipient'
    }
  }
  return { error, errorBody }
}

export const sendMoney = async (data) => {
  const sendData = {
    recipient: data.recipient,
    amountDQT: data.value,
    secretPhrase: nrsSecretPhrase
  }
  const requestType = 'sendMoney'
  return sendAxiosRequest(requestType, sendData)
}

export const transferAsset = async (data) => {
  const sendData = {
    recipient: data.recipient,
    quantityQNT: data.quantityQNT,
    asset: data.asset,
    secretPhrase: nrsSecretPhrase
  }
  const requestType = 'transferAsset'
  return sendAxiosRequest(requestType, sendData)
}
