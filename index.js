function _isPromise(objToCheck) {
  return Promise.resolve(objToCheck) === objToCheck
}

function _isFunction(objToCheck) {
  return objToCheck && {}.toString.call(objToCheck) === '[object Function]'
}

function _prepareError(err, data) {
  Object.assign(err, {
    ErrorString: err.toString(),
  })

  if (data) {
    Object.assign(err, {
      _data: data
    })
  }
}

function _defaultErrorLogger(err, level, label) {
  if (!console[level]) {
    level = 'error'
  }
  const displayErr = JSON.stringify(err, null, 2)

  const content = label ? `(${label}) ${displayErr}` : displayErr
  console[level](content)
}

function _rawTryInline(executionObj, { level, label, errData }, logErrorFunc) {
  if (_isPromise(executionObj)) {
    return executionObj
      .then(data => [null, data])
      .catch((err) => {
        _prepareError(err, errData)
        logErrorFunc(err, level, label)
        return [err, undefined]
      })
  }

  if (_isFunction(executionObj)) {
    try {
      const data = executionObj()
      return [null, data]
    } catch (err) {
      _prepareError(err, errData)
      logErrorFunc(err, level, label)
      return [err, undefined]
    }
  }

  return undefined
}

module.exports = class {

  /**
   * Creates a custom TryInline instance with specified options.
   *
   * @param {Object} options - TryInline instance options.
   * @param {logErrorFunc} options.logErrorFunc - Custom error handling function.
   * @param {string} options.defaultLogLevel - Set the default level for the logger.
   * @return {Function} The TryInline instance
   */

  /**
   * @name logErrorFunc
   * @function
   * @param {Object} err - The passed error object.
   * @param {string} level - Log level.
   * @param {string} label - Optional label, can be attached to the error log message.
   */
  constructor({ logErrorFunc, defaultLogLevel }) {
    return function customTryInline(executionObj, { level = defaultLogLevel, label = '', errData } = {}) {
      return _rawTryInline(executionObj, { level, label, errData }, logErrorFunc)
    }
  }

  /**
   * Wraps an execution safely. The default TryInline instance.
   *
   * @param {(Promise|Function)} executionObj - The object to execute.
   * @param {Object} [options]
   * @param {string} [options.level=error] - Method used from logger.
   * @param {string} [options.label] - Label attached to the error log message.
   * @param {Object} [options.errData] - Additional error information (assinged to `error._data`).
   * @return {(Promise|Object[])} Returning an array with [err, data].
   */
  static try_(executionObj, { level = 'error', label = '', errData } = {}) {
    return _rawTryInline(executionObj, { level, label, errData }, _defaultErrorLogger)
  }
}
