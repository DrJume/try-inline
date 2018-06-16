const filterObj = (objToFilter, allowedKeys) =>
  allowedKeys.reduce((obj, keyString) => {
    obj[keyString] =
      keyString.split('.')
        .reduce((filteredObj, key) => (filteredObj ? filteredObj[key] : undefined), objToFilter)
    return obj
  }, {})

const isPromise = (objToCheck) => Promise.resolve(objToCheck) === objToCheck
const isFunction = (objToCheck) => objToCheck && {}.toString.call(objToCheck) === '[object Function]'

function DefaultLogger(error, level, label) {
  if (!console[level]) {
    level = 'error'
  }

  const displayErr = JSON.stringify(error, null, 2)

  const logString = label ? `(${label}) ${displayErr}` : displayErr
  console[level](logString)
}

function handleError(error, logLvl, labelString, errData, Logger) {
  const errorString = error.toString()

  const [label, ...allowedKeys] = labelString.split('#')
  if (allowedKeys.length > 0) {
    error = filterObj(error, allowedKeys)
  }

  Object.assign(error, {
    ErrorString: errorString,
  })

  if (errData) {
    Object.assign(error, {
      ErrorData: errData,
    })
  }

  Logger ? Logger(error, logLvl, label) : DefaultLogger(error, logLvl, label)

  return error
}

function tryWrapper(
  executionObj,
  logOptionsString = '', // format="(logLvl:)labelString"
  { errData } = {},
  Logger,
  DefaultLogLevel = 'error'
) {
  const logOptions = logOptionsString.split(':')
  if (logOptions.length < 2) logOptions.unshift('')

  let [logLvl, labelString] = logOptions

  if (!logLvl) logLvl = DefaultLogLevel

  if (isPromise(executionObj)) {
    return executionObj
      .then(data => [null, data])
      .catch(err => [(handleError(err, logLvl, labelString, errData, Logger)), undefined])
  }

  if (isFunction(executionObj)) {
    try {
      const data = executionObj()
      return [null, data]
    } catch (err) {
      return [(handleError(err, logLvl, labelString, errData, Logger)), undefined]
    }
  }

  return undefined
}

module.exports = class {

  /**
   * Creates a custom TryInline instance with specified options.
   *
   * @param {Object} options - TryInline instance options.
   * @param {Logger} options.Logger - Custom error handling function.
   * @param {string} options.DefaultLogLevel - Set the default level for the logger.
   * @return {Function} The TryInline instance
   */

  /**
   * @name Logger
   * @function
   * @param {Object} error - The passed error object.
   * @param {string} level - Log level.
   * @param {string} label - Optional label, can be attached to the error log message.
   */
  constructor({ Logger, DefaultLogLevel }) {
    return (executionObj, logOptionsString, { errData }) =>
      tryWrapper(executionObj, logOptionsString, { errData }, Logger, DefaultLogLevel)
  }

  /**
   * Wraps an execution safely. The default TryInline instance.
   *
   * @param {(Promise|Function)} executionObj - The object to execute.
   * @param {string} [logOptionsString] - Format is "(logLevel:)labelString"
   * @param {Object} [options]
   * @param {Object} [options.errData] - Additional error information (assinged to `error.ErrorData`).
   * @return {(Promise|Object[])} Returning an array with [err, data].
   */
  static try_(...args) {
    return tryWrapper(...args)
  }
}
