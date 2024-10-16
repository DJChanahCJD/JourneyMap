// pages/detail/index.js

// 引入模拟数据
const mockData = require('../../data/mockData.js');

Page({
  data: {
    spot: {}, // 保存景点的详细信息
    collected: false // 是否收藏
  },

  onLoad: function (options) {
    const spotId = parseInt(options.id, 10); // 获取从导航中传来的景点ID
    this.loadSpotDetail(spotId); // 根据ID加载景点详情
    // 从本地存储中获取收藏的ID列表
    const favoriteSpotIds = wx.getStorageSync('favoriteSpotIds') || [];
    // 判断当前景点是否被收藏
    const isCollected = favoriteSpotIds.includes(spotId);
    console.log("spotId: ", spotId);
    console.log(favoriteSpotIds);
    console.log("onLoad: ", isCollected);
    // 更新页面收藏状态
    this.setData({
      collected: isCollected
    });
  },

  // 根据景点ID加载详情
  loadSpotDetail: function (id) {
    // 模拟获取景点数据（可以替换为网络请求）
    const spot = mockData.scenicSpots.find(spot => spot.id == id);
    if (spot) {
      this.setData({
        spot: spot
      });
    }
  },

  // 收藏/取消收藏
  onCollectToggle: function () {
    const spotId = this.data.spot.id;
    let favoriteSpotIds = wx.getStorageSync('favoriteSpotIds') || []; // 获取当前收藏的 ID 列表

    // 检查是否已经收藏
    if (favoriteSpotIds.includes(spotId)) {
      // 如果已经收藏，则移除
      favoriteSpotIds = favoriteSpotIds.filter(id => id !== spotId);
      this.setData({ collected: false });
      console.log("onCollectToggle: false", );
    } else {
      // 如果未收藏，则添加
      favoriteSpotIds.push(spotId);
      this.setData({ collected: true });
      console.log("onCollectToggle: true", );
    }

    // 更新本地存储
    wx.setStorageSync('favoriteSpotIds', favoriteSpotIds);
    console.log("spotId: ", spotId);
    console.log(wx.getStorageSync('favoriteSpotIds'));

    // 显示提示
    wx.showToast({
      title: this.data.collected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  }
});
