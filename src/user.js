import nxtCrypto from 'nxt-crypto'
const { parseToken, getAccountRS } = nxtCrypto

export const isAccountRS = async (ctx, next) => {
  const accountRS = ctx.query.accountRS || ctx.params.accountRS || ctx.body.accountRS
  const token = ctx.query.token || ctx.params.token || ctx.body.token

  try {
    if (!token || token.length !== 160) {
      throw Error()
    }

    const parsedToken = parseToken(token, accountRS)

    if (parsedToken.isValid && getAccountRS(parsedToken.publicKey, accountRS.slice(0, 3)) === accountRS) {
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
