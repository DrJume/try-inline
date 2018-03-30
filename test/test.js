process.on('unhandledRejection', (arg) => {
  console.log(arg)
});

(async () => {
  const { try_ } = require('../index.js')
  const TryInline = require('../index.js')

  function somePromise(arg) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (arg == 'err') {
          reject(new Error('bläblä'))
        }
        resolve(arg)
      }, 1000)
    })
  }

  function someFunction(arg) {
    if (arg == 'err') {
      throw new Error('bläbläsync')
    }
    return arg
  }

  let err, data

  // async
  [err, data] = await try_(somePromise('123'), { level: 'warn', label: 'SOME_PROMISE', errData: 'errDataPromise' });
  // if (err) process.exit(1);
  console.log(data);

  // normal function
  [err, data] = try_(() => someFunction('456'), { level: 'info', label: 'SOME_FUNC', errData: 'errDataSyncr' });
  // if (err) process.exit(1);
  console.log(data);

  const myTry_ = new TryInline({
    logErrorFunc(err, level, label) {
      console.log({ err, level, label })
    },
    defaultLogLevel: 'debug'
  });
  
  [err, data] = await myTry_(somePromise('45645'), { label: 'SOME_PROMISE', errData: 'errDataPromise' });
  console.log(data);

})()
