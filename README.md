# :traffic_light: TryInline
> An easy inline error handling wrapper for async promises and syncronous functions 

[![NPM Version][npm-image]][npm-url]

:bulb: _Inspired by [await-to-js](https://github.com/scopsy/await-to-js)_

## :gift: Example
```js
const { try_ } = require('try-inline');

let err, data;

// async
[err, data] = await try_(somePromise());
if (err) process.exit(1);
console.log(data);

// normal function
[err, data] = try_(() => someFunction());
if (err) process.exit(1);
console.log(data);
```

## :package: Installation
```bash
$ npm install try-inline
```

## :barber: Features
  - Inline error catching
  - Configurable error logging
  - Error object patching
    - on a execution fail, the returned error object includes its _ErrorString_
  - Labeling executions for better debugging
  - Filtering error results for specified key-paths
  (documentation coming soon)
    - only show specific keys from the error object

## :nut_and_bolt: API

### `try_(executionObj, logOptionsString, [options]) => [err, data]`

Wraps an execution safely. The default TryInline instance. 
- `executionObj` - the object to execute. Can be a **promise** or a **callback with a syncronous function**.
- `logOptionsString` - *optional* (you can leave it empty) option string for the logger.
  - Format: `"(logLevel:)labelString"`
    - `logLevel` - method used from logger. The default logger is the JavaScript global "console". So the available values are: _`info, log, warn, error`_. **Defaults** to `error`. When you want to use your own logger, take a look at creating your own TryInline custom instance.
    - `labelString` - optional label attached to the error log message. 
  - Example: `"warn:HTTP_TIMEOUT"` -> Logger gets the '*warn*' log-level and the label string '*HTTP_TIMEOUT*'
- `options` - optional object with:
  - `errData` - additional error information (assinged to `error.ErrorData`).

**Returns** an array with two values:
- `err` - the error obejct. When `executionObj` throws an error, it is assigned to `err`. Otherwise `err` is **null**.
- `data` - returned value from `executionObj`. On error it gets **undefined**.

```js
const { try_ } = require('try-inline');

let [err, data] = await try_(readFilePromise('lorem.txt'), 'warn:READ_FILE_ERR',
    { errData: "Safely ignore the error. The lorem file is optional." } 
});

// array destructuring is awesome!
let [err]    = ... // just get the error obj
let [, data] = ... // only get the data obj
```

### `new TryInline(options) => try_ (customized)`

Creates a custom TryInline instance with specified options.
- `options` - required object where:
  - `Logger` - custom error handling function. It gets _`error, level, label`_ passed as arguments.
  - `DefaultLogLevel` - set the default level for your Logger.

**Returns** a custom *`try_`* instance with attached `Logger`.

```js
const TryInline = require('try-inline');

const try_ = new TryInline({
  Logger: function(error, level, label) {
    const logMessage = label ? `(${label}) ${error}` : error;
    console[level](logMessage);
  },
  DefaultLogLevel: 'debug'
});
```

## :point_up: Notes
Do not always trust automatic semi-colon insertion (ASI) in JavaScript, when not using semi-colons! 
Be careful when assigning the output variables by destructuring the returned array!

When you want to be `100% safe`, then put a semi-colon in front of the destructuring statement:
```js
;[err, data] = await try_(somePromise())
```

## :page_with_curl: License
[MIT](https://github.com/DrJume/try-inline/blob/master/LICENSE)

[npm-image]: https://img.shields.io/npm/v/try-inline.svg
[npm-url]: https://www.npmjs.com/package/try-inline
