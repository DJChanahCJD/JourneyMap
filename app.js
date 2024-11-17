// app.js
const { login, getUserInfo } = require('./api/user');
const { getFavoriteSpotIds, updateFavoriteSpotIds, getTags, getCategories } = require('./api/spot');
const { getUpvotedCommentIds, updateUpvotedCommentIds } = require('./api/comment');

App({
  globalData: {
    userInfo: wx.getStorageSync('userInfo') || {
      userId: null,
      nickName: null,
      avatar: null,
    },
    latitude: null,
    longitude: null,
    tags: [],
    categories: [],
    favoriteSpotIds: [],
    upvotedCommentIds: [],
    amapKey: '96e3eef9050ea0c7d8e12ab8c541f395', // 高德地图API Key
  },

  updateLocation(latitude, longitude) {
    this.logDebug("Updating location", latitude, longitude);
    this.globalData.latitude = latitude;
    this.globalData.longitude = longitude;
  },

  // 更新收藏景点 ID
  updateFavoriteSpotIds(favoriteSpotIds) {
    this.logDebug("Updating favoriteSpotIds", favoriteSpotIds);
    this.globalData.favoriteSpotIds = favoriteSpotIds;
    updateFavoriteSpotIds(this.globalData.userInfo.userId, favoriteSpotIds)
        .then(response => this.logDebug("Favorite spot IDs updated successfully", response))
        .catch(error => console.error('Failed to update favorite spot IDs:', error));
  },

  // 更新点赞评论 ID
  updateUpvotedCommentIds(upvotedCommentIds) {
    this.logDebug("Updating upvotedCommentIds", upvotedCommentIds);
    this.globalData.upvotedCommentIds = upvotedCommentIds;
    updateUpvotedCommentIds(this.globalData.userInfo.userId, upvotedCommentIds)
        .then(response => this.logDebug("Upvoted comment IDs updated successfully", response))
        .catch(error => console.error('Failed to update upvoted comment IDs:', error));
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.logDebug("Updating userInfo", userInfo);

    this.globalData.userInfo = { userId: userInfo.userId || userInfo.uuid, avatar: userInfo.avatar || userInfo.avatarUrl, nickName: userInfo.nickName || userInfo.name };
    wx.setStorageSync('userInfo', userInfo);
  },

  // 统一日志管理
  logDebug(message, data) {
    console.log(`[DEBUG] ${message}: `, data);
  },

  // 应用启动时执行
  onLaunch() {
    this.handleUserLogin();
    getTags().then(res => this.globalData.tags = res);
    getCategories().then(res => this.globalData.categories = res);
    console.log("globalData: ", this.globalData);
  },

  // 处理用户登录逻辑
  handleUserLogin() {
    wx.login({
      success: ({ code }) => {
        if (code) {
          this.logDebug("Login code obtained", code);
          login(code)
            .then(response => {
              this.logDebug("Login response obtained", response);
              this.globalData.userInfo.userId = response.data.openid;
              this.logDebug("Login globalData.userInfo obtained", this.globalData.userInfo);
              this.getUserSettings();
            })
            .catch(error => console.error('Failed to obtain userId:', error));
        } else {
          console.error('Login failed:', res.errMsg);
        }
      }
    });
  },

  // 获取用户设置信息
  getUserSettings() {
    wx.getSetting({
      success: res => {
        this.logDebug("User settings obtained", res);
        if (res.authSetting['scope.userInfo']) {
          getUserInfo(this.globalData.userInfo.userId)
            .then(response => {
              console.log("updateUserInfo:", response);
              this.updateUserInfo(response.data);
            })
            .catch(error => console.error('Failed to get user info:', error));
        }
      }
    });
  },

  // 应用隐藏时执行
  onHide() {
    this.syncUserData();
  },

  // 应用退出时执行
  onUnload() {
    this.syncUserData();
  },

  // 抽取同步数据的逻辑为独立函数
  syncUserData() {
    const { userId, favoriteSpotIds, upvotedCommentIds } = this.globalData;
    if (userId) {
      // 同步收藏数据
      updateFavoriteSpotIds(userId, favoriteSpotIds)
        .then(response => this.logDebug("Favorite spot IDs updated successfully", response))
        .catch(error => console.error('Failed to update favorite spot IDs:', error));

      // 同步点赞数据
      updateUpvotedCommentIds(userId, upvotedCommentIds)
        .then(response => this.logDebug("Upvoted comment IDs updated successfully", response))
        .catch(error => console.error('Failed to update upvoted comment IDs:', error));
    }
  },
});
