// app.js
// import { init } from '@cloudbase/weda-client';
// init({
//   envID: 'journeymap-8guldi1x22f48179', // 云开发环境Id
//   appConfig: {
//     staticResourceDomain: 'https://journeymap-8guldi1x22f48179.ap-shanghai.tcb-api.tencentcloudapi.com', // 云开发环境下静态托管域名，用于使用素材资源
//   }
// })

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
