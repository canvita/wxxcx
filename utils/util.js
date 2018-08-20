import Promise from '../libs/es6-promise/lib/es6-promise.auto.js';
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getSync = (url) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      success(res) {
        resolve(res);
      },
      fail(res) {
        throw(res);
      }
    })
  })
}

module.exports = {
  formatTime: formatTime,
  getSync: getSync,
}


