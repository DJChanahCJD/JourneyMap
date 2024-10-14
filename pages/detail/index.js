// pages/detail/index.js

// 引入模拟数据
const mockData = require('../../data/mockData.js');

Page({
  data: {
    spot: {}, // 保存景点的详细信息
    collected: false // 是否收藏
  },

  onLoad: function (options) {
    const spotId = options.id; // 获取从导航中传来的景点ID
    this.loadSpotDetail(spotId); // 根据ID加载景点详情
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
    this.setData({
      collected: !this.data.collected
    });

    wx.showToast({
      title: this.data.collected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  }
});
