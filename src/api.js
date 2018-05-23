import { Account, AccountVerificationApplication } from './database'
import asyncBusboy from 'async-busboy'
import config from '../config.json'
const { awsID, awsSecret, awsBucket, awsMasterKey } = config
const aesKey = Buffer.alloc(32, awsMasterKey)
import AWS from 'aws-sdk'

import fs from 'fs'
import awaitfs from 'await-fs'
import filepath from 'filepath'
import nodemailer from 'nodemailer'
import twoFactor from 'node-2fa'


const S3Client = new AWS.S3({
  accessKeyId: awsID,
  secretAccessKey: awsSecret,
  maxRetries: 3
})


export const register = async (ctx) => {
  const {
    username,
    email,
    secretPhrase,
    accountRS
  } = ctx.body
  await Account.update(
    { username, secretPhrase, accountRS },
    { where: { email } }
  ).then(async (result) => {
    console.log(result)
    ctx.body = {
      'status': 'success',
      result
    }
  })
}

export const changePassword = async (ctx) => {
  const {
    username,
    email,
    secretPhrase,
    accountRS
  } = ctx.body

  await Account.update(
    { secretPhrase: secretPhrase },
    { where: { accountRS: accountRS } }
  ).then(async (result) => {
    ctx.body = {
      'status': 'success',
      result
    }
  })
}

export const verifyMessage = async (ctx) => {
  const {
    username,
    email
  } = ctx.body

  let newSecret = twoFactor.generateSecret({username, email})
  let newToken = twoFactor.generateToken(newSecret)

  await Account.update(
   { token: newSecret },
   { where: { email } }
   ).then(async (result) => {
   let transporter = nodemailer.createTransport({
          service: 'outlook',
          auth:{
            user: 'lawtony2018@outlook.com',
            pass: 'qweASD1@#'
          }
        })
        let mailOptions = {
          from: 'lawtony2018@outlook.com',
          to: email,
          subject: 'Welcome to Wang Coin',
          text: `Your secret key is:${newToken}`
        }
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
            console.log(error)
          } else {
            console.log('Email send:' + info.response)
          }

        })
        ctx.body = {
        'status': 'success',
        'code': '1'
        }
   })
  

}
export const verifyEmail = async (ctx) => {

  const {
    email
  } = ctx.body
  await Account.findOne({
    where: {
      email
    }
  }).then(async (result) => {
    if(result){
      ctx.body = {
        'status': 'success',
        'code': '0'
        }
      } else {
        let code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000

        ctx.body = {
          username: email,
          email: email,
          secretPhrase: email,
          accountRS: code
        }
        
        await Account.create({
            ...ctx.body
          }).then(async (result) => {
            let transporter = nodemailer.createTransport({
              service: 'outlook',
              auth:{
                user: 'lawtony2018@outlook.com',
                pass: 'qweASD1@#'
              }
            })
            let mailOptions = {
              from: 'lawtony2018@outlook.com',
              to: email,
              subject: 'Welcome to Wang Coin',
              text: `Hi.\n Thank you for joining Wang Coin! To finish register, you just need to confirm that we got your email right.\n Verify code:${code}`
            }
            transporter.sendMail(mailOptions, function(error, info){
              if(error){
                console.log(error)
              } else {
                console.log('Email send:' + info.response)
              }

            })
            ctx.body = {
            'status': 'success',
            'code': '1'
            }
          })
      }
    }, async (err) => {
      ctx.body = {
      'status': 'fail',
      'code': err
      }
    })
}

export const verifyCode = async (ctx) => {
  const {
    email,
    code
  } = ctx.body
  await Account.findOne({
    where: {
      email,
      accountRS: code
    }
  }).then(async (result) => {
    if(result){
      ctx.body = {
        'status': 'success',
        'code': '1'
        }
      } else {
        ctx.body = {
        'status': 'success',
        'code': '0'
        }
      }
    }, async (err) => {
      ctx.body = {
        'status': 'fail',
        'code': err
        }
    })
}
export const getAccount = async (ctx) => {
  const {
    username,
    email,
    code
  } = ctx.query

  console.log(code)

  await Account.findOne({
    where: {
      username,
      email
    }
  }).then(async (result) => {
    console.log(result)
    ctx.body = {
        status: 'success',
        account: result
      }
    }, async (err) => {
      ctx.body = {
        status: 'error',
        errorDescription: 'User not found'
      }
    })

  
  //console.log(ctx.body)
}

export const getAccounts = async (ctx) => {
  let { limit, offset, search } = ctx.query
  if (!limit || limit <= 0) limit = 10
  if (!offset || offset < 0) offset = 0

  limit = Number(limit)
  offset = Number(offset)

  const query = {
    limit,
    offset,
    order: 'createdAt DESC'
  }

  if (search) {
    query.where = {
      username: {
        $like: `${search}%`
      }
    }
    query.where = {
      $or: [{
        username: {
          $like: `${search}%`
        }
      }, {
        email: {
          $like: `${search}%`
        }
      }, {
        accountRS: {
          $like: `${search}%`
        }
      }
    ]
    }
  }

  await Account.findAndCountAll(query).then(async (result) => {
    ctx.body = {
      status: 'success',
      accounts: result.rows,
      recordsTotal: result.count
    }
  })
}

export const getConstants = async (ctx) => {
  ctx.body = {
    walletVersion: '0.8.0'
  }
}

export const createVerification = async (ctx) => {
  const { files, fields } = await asyncBusboy(ctx.req)
  
  let accountRS
  let filePath
  const filesArray = []
  if (fields.accountRS) {
    accountRS = fields.accountRS
  }
  var dir = `/wng-middleware-master/img/${accountRS}`
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir)
  }
  files.map( (file) =>  {
    const name = file.fieldname
    var oldpath = file.path
    filePath = `${dir}/${name}`
    fs.rename(oldpath, filePath, function(err){
      if(err) console.log(err)
      else console.log(`${name} is uploaded`)
    })
  /* await fs.rename(oldpath, filePath)
   var stats = await fs.stat(oldpath, filePath)
   console.log(`stats:${JSON.stringify(stats)}`)*/
    filesArray.push(name)
  })

  fields.files = filesArray.join()
  
  await AccountVerificationApplication.create(fields, {}).then(async (result) => {
    ctx.body = result
  })
}

export const getEncryptedVerification = async (ctx) => {
  const { accountRS, file } = ctx.params
  //console.log(ctx.params)
  //console.log(accountRS+file)
  const filePath = `/wng-middleware-master/img/${accountRS}/${file}`
  try {
    let content = await awaitfs.readFile(filePath)
    ctx.set('Content-Type', 'application/octet-stream')
    ctx.body = content;
  } catch(err) {
    ctx.set('Content-Type','text/html')
    //console.log(err)
    ctx.body = "No Such image"
  }

}

export const hasVerification = async (ctx) => {
  const {
    accountRS
  } = ctx.params

  await AccountVerificationApplication.findOne({
    where: {
      accountRS
    },
    order: [
      ['createdAt', 'DESC']
    ]
  }).then(async (result) => {
    if (!result) {
      ctx.body = {
        status: 'error',
        errorDescription: 'No verification application found'
      }
    } else {
      ctx.body = {
        status: 'success',
        account: result
      }
    }
  })
}

export const getVerifications = async (ctx) => {
  let { limit, offset, search } = ctx.query
  if (!limit || limit <= 0) limit = 10
  if (!offset || offset < 0) offset = 0

  limit = Number(limit)
  offset = Number(offset)

  const query = {
    limit,
    offset,
    order: 'createdAt DESC'
  }

  if (search) {
    query.where = {
      accountRS: {
        $like: `${search}%`
      }
    }
  }

  await AccountVerificationApplication.findAndCountAll(query).then(async (result) => {
    ctx.body = {
      status: 'success',
      applications: result.rows,
      recordsTotal: result.count
    }
  })
}

export const updateAccountStatus = async (ctx) => {
  const { id } = ctx.params
  const {
    status
  } = ctx.body
  await AccountVerificationApplication.update(
    { status: status },
    { where: { id } }
  ).then(async (result) => {
    ctx.body = {
      'status': 'success',
      result
    }
  })
}
