process.on('unhandledRejection', (arg) => {
  console.log(arg)
});

(async () => {
  const { try_ } = require('../index.js')
  const TryInline = require('../index.js')

  function somePromise(arg) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (arg === 'err') {
          reject(new Error('ERRORSTRING'))
        }
        resolve(arg)
      }, 1000)
    })
  }

  function someFunction(arg) {
    if (arg === 'err') {
      throw new Error('ERRORSTRING')
    }
    return arg
  }

  let err, data

  // async
  [err, data] = await try_(somePromise('err'), 'warn:SOME_PROMISE', { errData: 'errDataPromise' });
  // if (err) process.exit(1);
  console.log(data);

  // normal function
  [err, data] = try_(() => someFunction('err'), 'info:SOME_FUNC', { errData: 'errDataSyncr' });
  // if (err) process.exit(1);
  console.log(data);

  const myTry_ = new TryInline({
    Logger(error, level, label) {
      console.log(JSON.stringify({ error, level, label }, null, 2))
    },
    DefaultLogLevel: 'debug'
  });

  [err, data] = await myTry_(somePromise('err'), '', { errData: 'errDataPromise' });
  console.log(data);

})()
