const crypto = require('crypto')

const generateHMAC = (message, apiSecret, digest = 'hex') => (
  crypto.createHmac('sha256', apiSecret)
    .update(message)
    .digest(digest)
)

const compareHashes = (
  digestable,
  checkSumable,
  encoding = 'utf8'
) => {
  const digest = (digestable instanceof ArrayBuffer)
    ? Buffer.from(digestable)
    : Buffer.from(digestable, encoding)

  const checkSum = (checkSumable instanceof ArrayBuffer)
    ? Buffer.from(checkSumable)
    : Buffer.from(checkSumable, encoding)

  return (
    (digest.length === checkSum.length) &&
    crypto.timingSafeEqual(
      digest,
      checkSum
    )
  )
}

const ensureArray = (array) => (
  (array == undefined) ? [] : Array.isArray(array) ? array : [array]
)

const ensureString = (string) => (
  string ? `${string}` : ''
)

// TODO: explore places using ensureNumeric to move to isNumericNegatable
const ensureNumeric = (string) => (
  Number(ensureString(string).replace(/[^0-9.]/gi, ''))
)

const isType = (value, type) => (
  // eslint-disable-next-line eqeqeq, valid-typeof
  (value != undefined) && (typeof value === type)
)

const isString = (value) => (
  isType(value, 'string') ||
  (value instanceof String)
)

// NOTE: this is used to ensure when we are in non-local that we parse the value from secrets manager (and when running local that we ignore the unresolved {{resolve... value)
const prepareEnv = (env = process.env) => {
  const { SECURE } = env

  if (SECURE && !SECURE.startsWith('{{')) {
    return {
      ...env,
      ...JSON.parse(SECURE || '{}')
    }
  }

  return env
}


module.exports = {
  isType,
  isString,
  prepareEnv,
  generateHMAC,
  compareHashes,
  ensureNumeric,
  ensureString,
  ensureArray,
}
