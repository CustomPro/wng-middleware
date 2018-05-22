import config from '../config.json'
import nxtCrypto from 'nxt-crypto'
const { parseToken } = nxtCrypto
const { adminPublicKeys } = config

export const isAdmin = async (ctx, next) => {
  const { token } = ctx.query

  try {
    if (!token || token.length !== 160) {
      throw Error()
    }

    const parsedToken = parseToken(token, 'admin')

    if (parsedToken.isValid && adminPublicKeys.includes(parsedToken.publicKey)) {
      return await next()
    }

    throw Error()
  } catch (e) {
    ctx.body = {
      status: 'error',
      errorDescription: 'Invalid token',
      errorMessage: 'token'
    }
  }
}

export const isAdminPost = async (ctx, next) => {
  const { token } = ctx.body

  try {
    if (!token || token.length !== 160) {
      throw Error()
    }

    const parsedToken = parseToken(token, 'admin')

    if (parsedToken.isValid && adminPublicKeys.includes(parsedToken.publicKey)) {
      return await next()
    }

    throw Error()
  } catch (e) {
    ctx.body = {
      status: 'error',
      errorDescription: 'Invalid token'
    }
  }
}
