const { ensureNumeric } = require('./utils')

class RuntimeError extends Error {
  constructor(message, data, code = 200, errorType) {
    super(message)
    this.data = data
    this.errorType = errorType
    this.code = ensureNumeric(code)
    this.name = 'RuntimeError'
    Object.setPrototypeOf(this, RuntimeError.prototype)
  }
}

class ConfigurationError extends RuntimeError {
  constructor(message, data, code, errorType) {
    super(message, data, code, errorType)
    this.name = 'ConfigurationError'
    Object.setPrototypeOf(this, ConfigurationError.prototype)
  }
}

class HandleableError extends RuntimeError {
  constructor(message, data, code, errorType) {
    super(message, data, code, errorType)
    this.name = 'HandleableError'
    Object.setPrototypeOf(this, HandleableError.prototype)
  }
}

class AggregateHandleableError extends RuntimeError {
  constructor(message, data, code, errorType) {
    const { response, scopeErrors, messages: _messages, ..._data } = data ?? {}
    const messages = [...new Set(_messages ?? [])]
    super(message || messages[0], data, code, errorType)
    this.data = _data
    this.response = response
    this.messages = messages
    this.scopeErrors = scopeErrors
    this.name = 'AggregateHandleableError'
    Object.setPrototypeOf(this, AggregateHandleableError.prototype)
  }
}

module.exports = {
  RuntimeError,
  HandleableError,
  ConfigurationError,
  AggregateHandleableError,
}
