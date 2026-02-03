const path = require('path')

if (!process.env.AWS_EXECUTION_ENV && !process.env.LAMBDA_TASK_ROOT) {
  require('dotenv').config({ path: path.join(process.cwd(), '.env') })
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })
}

const {
  getVerificationHelpers,
  VerificationError,
  PreconditionError,
} = require('@agnostack/verifyd')

const {
  isString,
  prepareEnv,
  generateHMAC,
  compareHashes,
  ensureNumeric,
} = require('./utils')
const { ConfigurationError, RuntimeError } = require('./errors')

const exampleData = require('../data')
const extendCart = require('./extend/cart')

const ERROR_MESSAGE = 'Error executing API request'

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

const execute = async (event) => {
  let decryptedRequestBody
  let encryptResponseBody
  let statusCode
  let body

  const {
    PUBLIC_KEY,
    PRIVATE_KEY,
    SHARED_SECRET,
  } = prepareEnv()

  const _getVerificationHelpers = getVerificationHelpers({
    keyPairs: {
      shared: {
        publicKey: PUBLIC_KEY,
        privateKey: PRIVATE_KEY,
      },
    },
  })

  try {
    ({ requestBody: decryptedRequestBody, processResponse: encryptResponseBody } = await _getVerificationHelpers(
      { headers: event.headers, rawBody: event.body },
    ))
  } catch (error) {
    if (error instanceof VerificationError) {
      console.info('Error VerificationError', error)
      throw error
    }

    console.error('Verification error', error)
    throw new PreconditionError('Verification error')
  }

  try {
    const {
      'x-hmac-sha256': _hmacHeader,
      'X-Hmac-Sha256': hmacHeader = _hmacHeader,
    } = event?.headers ?? {}

    if (!hmacHeader || !compareHashes(hmacHeader, generateHMAC(event?.body, SHARED_SECRET))) {
      throw new ConfigurationError('Invalid Request: Missing or invalid verification header.')
    }

    const route = event.pathParameters?.route ?? event?.queryStringParameters?.route

    if (!route) {
      throw new ConfigurationError('Invalid Request: Missing required route param')
    }
  
    let decryptedResponse

    if (route === 'extend') {
      const { data, context } = decryptedRequestBody ?? {}

      // NOTE: this is where you would extend any of the core data types (cart, order, customer, etc.) - if needed
      if (data?.cart) {
        let output = data

        if (isString(context?.idempotency_key)) {
          output.idempotency_key = context.idempotency_key
        }

        output.cart = await extendCart(data.cart)

        decryptedResponse = output
      }
    } else {
      // NOTE: this is where you would add any custom (insights, events, etc.) based on the route - sample response data checked in as example only!
      decryptedResponse = exampleData[route]
    }

    if (!decryptedResponse) {
      throw new RuntimeError(`Route not implemented: '${route}'`)
    }

    statusCode = 200
    body = await encryptResponseBody(decryptedResponse) // NOTE: this handles re-encrypting
  } catch (error) {
    statusCode = ensureNumeric(error?.code ?? 500)

    const errorType = error?.name || 'Error'
    const isExtendedError = (errorType !== 'Error')
    const errorMessage = isExtendedError
      ? error?.message || ERROR_MESSAGE
      : ERROR_MESSAGE

    console.error(errorMessage, error)

    const errorBody = {
      error: {
        message: errorMessage,
        ...isExtendedError && {
          name: errorType,
          ...error?.data && { data: error.data },
          ...error?.response && { response: error.response },
          ...error?.messages && { messages: error.messages },
          ...error?.errorType && { errorType: error.errorType },
          ...error?.scopeErrors && { scopeErrors: error.scopeErrors },
        },
        ...((statusCode > 299) && (statusCode < 500)) && { code: error.code },
      }
    }

    try {
      body = await encryptResponseBody(errorBody)
    } catch {
      body = errorBody
    }
  }

  const responseBody = isString(body) ? body : JSON.stringify(body)

  return { statusCode, headers: BASE_HEADERS, body: responseBody }
}

module.exports = { execute }
