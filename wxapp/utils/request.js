function request(options) {
  const token = wx.getStorageSync('jwt');
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      header: {
        ...(options.header || {}),
        Authorization: token ? `Bearer ${token}` : ''
      },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
}
module.exports = { request };
