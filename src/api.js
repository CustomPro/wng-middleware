import { Account, AccountVerificationApplication } from './database'
import asyncBusboy from 'async-busboy'
import config from '../config.json'
const { awsID, awsSecret, awsBucket, awsMasterKey, defaultEmailAddress, emailService } = config
const aesKey = Buffer.alloc(32, awsMasterKey)
const emailPassword = 'asi1234567890'
import AWS from 'aws-sdk'

import fs from 'fs'
import awaitfs from 'await-fs'
import nodemailer from 'nodemailer'
import twoFactor from 'node-2fa'
import en from './translations/en'
import zh from './translations/zh-cn'
import bm from './translations/bm'
import tm from './translations/tm'


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
  console.log(email)
  console.log(accountRS)
  console.log(username)
  await Account.update(
    { username, secretPhrase, accountRS },
    { where: { email: email } }
  ).then(async (result) => {

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
    accountRS,
    code
  } = ctx.body
  await Account.findOne({
    where: {
      accountRS
    }
  }).then(async (result) => {
    const savedToken = result.token

    let flag = twoFactor.verifyToken(savedToken, code, 10)

    if( flag.delta < 1 && flag.delta > -10 ){
      ctx.body = {
      'status': 'success',
      'code': '1'
      }
    } else {
      ctx.body = {
        status: 'error',
        code: '0'
      }
    }
  }, async (err) => {
      ctx.body = {
        status: 'error',
        code: '0'
      }
    })
  

}
export const verifyEmail = async (ctx) => {

  const {
    email,
    language
  } = ctx.body

  let locale = en
  console.log('language')
  console.log(language)
  if(!language || language == 'undefined') {
    locale = en
  } else {
    if (language.indexOf('zh') !== -1) {
    locale = zh
    }
    if (language.indexOf('bm') !== -1) {
      locale = bm
    }
    if (language.indexOf('ta') !== -1) {
      locale = ta
    }
  }
  await Account.findOne({
    where: {
      email
    }
  }).then(async (result) => {
    if(result){
      if(result.username != email){
        ctx.body = {
          'status': 'success',
          'code': '0'
          }
        } else {
        let code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
        
        await Account.update(
            { token: code },
            { where: { email: email } }
          ).then(async (result) => {
            let transporter = nodemailer.createTransport({
              service: emailService,
              auth:{
                user: defaultEmailAddress,
                pass: emailPassword
              }
            })
            let mailOptions = {
              from: defaultEmailAddress,
              to: email,
              subject: locale.subject,
              text: `${locale.hello}\n ${locale.content}\n ${locale.code}${code} \n\n ${locale.thank} \n\n ${locale.contact}`
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
      } else {
        let code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000

        ctx.body = {
          username: email,
          email: email,
          secretPhrase: email,
          accountRS: email,
          token: code
        }
        
        await Account.create({
            ...ctx.body
          }).then(async (result) => {
            let transporter = nodemailer.createTransport({
              service: emailService,
              auth:{
                user: defaultEmailAddress,
                pass: emailPassword
              }
            })
            let mailOptions = {
              from: defaultEmailAddress,
              to: email,
              subject: locale.subject,
              text: `${locale.hello}\n ${locale.content}\n ${locale.code}${code} \n\n ${locale.thank} \n\n ${locale.contact}`
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
      token: code
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
    language
  } = ctx.query

  let locale = en
    console.log('language')
  console.log(language)

  if(!language || language == 'undefined') {
    locale = en
  } else {
    if (language.indexOf('zh') !== -1) {
    locale = zh
    }
    if (language.indexOf('bm') !== -1) {
      locale = bm
    }
    if (language.indexOf('ta') !== -1) {
      locale = ta
    }
  }
  await Account.findOne({
    where: {
      username,
      email
    }
  }).then(async (result) => {
      let newSecret = twoFactor.generateSecret({name: username, account: email})
      let newToken = twoFactor.generateToken(newSecret.secret)
      console.log(newToken)
      await Account.update(
       { token: newSecret.secret },
       { where: { email } }
       ).then(async (res) => {
          let transporter = nodemailer.createTransport({
              service: emailService,
              auth:{
                user: defaultEmailAddress,
                pass: emailPassword
              }
            })
            let mailOptions = {
              from: defaultEmailAddress,
              to: email,
              subject: locale.subject2,
              text: `${locale.hello}\n ${locale.content2}\n ${locale.code2} ${newToken.token} \n\n ${locale.thank} \n\n ${locale.contact}`
            }
            transporter.sendMail(mailOptions, function(error, info){
              if(error){
                console.log(error)
              } else {
                console.log('Email send:' + info.response)
              }

            })
            ctx.body = {
              status: 'success',
              account: result
            }
       })    
    }, async (err) => {
      ctx.body = {
        status: 'error',
        errorDescription: 'User not found'
      }
    })


}
export const getAccountByRS = async (ctx) => {
  const {
    RS,
    language
  } = ctx.query
  
  let locale = en
  if(!language || language == 'undefined') {
    locale = en
  } else {
    if (language.indexOf('zh') !== -1) {
    locale = zh
    }
    if (language.indexOf('bm') !== -1) {
      locale = bm
    }
    if (language.indexOf('ta') !== -1) {
      locale = ta
    }
  }
  
  await Account.findOne({
    where: {
      accountRS: RS
    }
  }).then(async (result) => {
    let newSecret = twoFactor.generateSecret({ accountRS: RS })
    let newToken = twoFactor.generateToken(newSecret.secret)

    await Account.update(
       { token: newSecret.secret },
       { where: { accountRS: RS } }
       ).then(async (res) => {
           let transporter = nodemailer.createTransport({
              service: emailService,
              auth:{
                user: defaultEmailAddress,
                pass: emailPassword
              }
            })
            let mailOptions = {
              from: defaultEmailAddress,
              to: email,
              subject: locale.subject2,
              text: `${locale.hello}\n ${locale.content2}\n ${locale.code2}${newToken.token} \n\n ${locale.thank} \n\n ${locale.contact}`
            }
            transporter.sendMail(mailOptions, function(error, info){
              if(error){
                console.log(error)
              } else {
                console.log('Email send:' + info.response)
              }

            })
          ctx.body = {
            status: 'success',
            account: result
          }
      })
  }, async (err) => {
    ctx.body = {
      status: 'error',
      errorDescription: 'User not found'
    }
  })
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
    query.where = {
      accountRS: {
        $like: `WNG%`
      }
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
  var dir = `/root/middleware/img/${accountRS}`
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
  const filePath = `/root/middleware/img/${accountRS}/${file}`
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
