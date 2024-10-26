// app.js
// import { init } from '@cloudbase/weda-client';
// init({
//   envID: 'journeymap-8guldi1x22f48179', // 云开发环境Id
//   appConfig: {
//     staticResourceDomain: 'https://journeymap-8guldi1x22f48179.ap-shanghai.tcb-api.tencentcloudapi.com', // 云开发环境下静态托管域名，用于使用素材资源
//   }
// })
// const APPID = "wx39efc4783f761db1";
// const SECRET = "24eaf3fd01e92b853c546514c3a02a9f";
// let JSCODE = "";
// let authorization_code = "";


const { login } = require('./api/user');
const { getFavoriteSpotIds, updateFavoriteSpotIds } = require('./api/spot')
const { getUpvotedCommentIds, updateUpvotedCommentIds } = require('./api/comment')
App({
  globalData: {
    favoriteSpotIds: wx.getStorageSync('favoriteSpotIds') || [],
    upvotedCommentIds: [],
    userInfo: null,
    openId: null,
  },

  updateFavoriteSpotIds(favoriteSpotIds) {
    this.globalData.favoriteSpotIds = favoriteSpotIds;
    wx.setStorageSync('favoriteSpotIds', this.globalData.favoriteSpotIds);
  },

  updateUpvotedCommentIds(upvotedCommentIds) {
    this.globalData.upvotedCommentIds = upvotedCommentIds;
    wx.setStorageSync('upvotedCommentIds', this.globalData.upvotedCommentIds);
  },

  onLaunch() {
    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          // 将 code 发送到后端
          login(res.code).then(response => {
            console.log("response: ", response);
            console.log("response.openId: ", response.openId);
            this.globalData.openId = response.openId;
            console.log('获取到的 openid:', this.globalData.openId);

            getFavoriteSpotIds(this.globalData.openId).then(response => {
              console.log("favprote response: ", response);
              wx.setStorageSync('favoriteSpotIds', response);
              console.log("favoriteSpotIds: ", wx.getStorageSync('favoriteSpotIds'));
              console.log("favoriteSpotIds type: ", typeof wx.getStorageSync('favoriteSpotIds'));
            }).catch(error => {
              console.error('获取收藏的景点 ID 失败:', error);
            });
            getUpvotedCommentIds(this.globalData.openId).then(response => {
              console.log("response: ", response);
              wx.setStorageSync('upvotedCommentIds', response.commentIds);
            }).catch(error => {
              console.error('获取点赞的评论 ID 失败:', error);
            });
          }).catch(error => {
            console.error('获取 openid 失败:', error);
          });
        } else {
          console.log('登录失败：' + res.errMsg);
        }
      }
    });

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          console.log("getSetting!!!");
          wx.getUserProfile({
            desc: '用于完善个人资料',
            success: res => {
              // 将用户信息存储到 globalData
              this.globalData.userInfo = res.userInfo;
              this.globalData.openId = res.openId;
              console.log("res: ", res);
              console.log("this.globalData.openId: ", this.globalData.openId);
              console.log("this.globalData.userInfo: ", this.globalData.userInfo);
            }
          });
        }
      }
    });
  },

  onHide() {
    updateFavoriteSpotIds(this.globalData.openId, wx.getStorageSync('favoriteSpotIds')).then(response => {
      console.log("response: ", response);
    }).catch(error => {
      console.error('更新收藏的景点 ID 失败:', error);
    });
    updateUpvotedCommentIds(this.globalData.openId, wx.getStorageSync('upvotedCommentIds')).then(response => {
      console.log("response: ", response);
    }).catch(error => {
      console.error('更新点赞的评论 ID 失败:', error);
    });
  },
});
