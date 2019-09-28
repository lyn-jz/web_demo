// 实现链式调用
function myPromise(cb) {
  let status = 'pending';
  let __val;
  let resolve = (val) => {
    status = 'resolve';
    __val = val;
  }
  let reject = (err) => {
    status = 'rejected';
    __err = err;
  }
  cb && cb(resolve, reject);
  this.then = function (succFn, failFn) {
    if (status === 'resolve') {
      __val = succFn(__val);
    } else if (status === 'rejected') {
      __err = failFn(__err);
    }
    return new myPromise((resolve) => {
      resolve();
    });
  }
  return this;
}

new myPromise((resolve, reject) => {
  console.log('1');
  reject(33);
}).then((val) => {
  console.log('success:', val);
}, (err) => {
  console.log('err: ', err);
})
