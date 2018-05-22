import { Voucher } from '../database'
import { validateVoucher, sendMoney, sendRequest } from '../utils'
import shortid from 'shortid'

export const createVoucher = async (ctx) => {
  const {
    multiple,
    value,
    code,
    expiration,
    recipient,
    createdBy,
    amount } = ctx.body

  const voucherData = { value, createdBy, expiration, recipient }

  if (multiple === 'true' || multiple === true) {
    const vouchersArray = []
    for (let i = 0; i < parseInt(amount); i++) {
      const generatedVoucher = {
        value,
        code: shortid.generate(),
        createdBy,
        expiration,
        recipient
      }
      vouchersArray.push(generatedVoucher)
    }
    await Voucher.bulkCreate(vouchersArray).then(async (result) => {
      ctx.body = result
    })
  } else {
    voucherData.code = code
    await Voucher.create(voucherData).then(async (result) => {
      ctx.body = result
    })
  }
}

export const getVouchers = async (ctx) => {
  let { limit, offset } = ctx.query
  if (!limit || limit <= 0) limit = 10
  if (!offset || offset < 0) offset = 0

  limit = Number(limit)
  offset = Number(offset)

  const query = {
    where: {
      $or: [
        {
          expiration: {
            $gte: new Date()
          }
        },
        {
          expiration: {
            $eq: null
          }
        }
      ]
    },
    limit,
    offset,
    order: 'createdAt DESC'
  }

  await Voucher.findAndCountAll(query).then(async (result) => {
    ctx.body = {
      status: 'success',
      vouchers: result.rows,
      recordsTotal: result.count
    }
  })
}


export const getSingleVoucher = async (ctx) => {
  const { code, accountRS } = ctx.body
  await Voucher.findOne({
    where: {
      code
    }
  }).then(async (result) => {
    if (!result) {
      ctx.body = {
        status: 'error',
        errorDescription: 'No voucher found',
        errorMessage: 'none'
      }
    } else {
      let error
      if (result.recipient !== null && result.recipient !== accountRS) {
        error = true
        errorBody = {
          status: 'error',
          errorDescription: 'You do not have permission to redeem this voucher',
          errorMessage: 'recipient'
        }
      }
      const filteredVoucher = {
        code: result.code,
        value: result.value,
        expiration: result.expiration
      }
      if (error !== true) {
        ctx.body = {
          status: 'success',
          voucher: filteredVoucher
        }
      } else {
        ctx.body = errorBody
      }
    }
  })
}

export const redeemVoucher = async (ctx) => {
  const { code, accountRS } = ctx.body
  await Voucher.findOne({
    where: {
      code
    }
  }).then(async(result) => {
    const valid = validateVoucher(result, accountRS)
    if (valid.error === false) {
      const data = { value: result.value, recipient: accountRS }
      await sendMoney(data).then(async (response) => {
        await Voucher.update(
          { redeemed: true,
            redeemedBy: accountRS },
          { where: { code } }
        ).then(async (dbResponse) => {
          ctx.body = {
            'status': 'success',
            voucher: dbResponse
          }
        })
      })

    } else {
      ctx.body = valid.errorBody
    }
  })
}
