// pages/detail/index.js

// 引入模拟数据
const mockData = require('../../data/mockData.js');

Page({
  data: {
    spot: {}, // 保存景点的详细信息
    collected: false, // 是否收藏
    currentImageIndex: 0, // 当前显示的图片索引
    autoplay: false,
    paginationPosition: 'bottom-right',
    navigation: { type: 'fraction' },
  },


  onLoad: function (options) {
    const spotId = parseInt(options.id, 10); // 获取从导航中传来的景点ID
    this.loadSpotDetail(spotId); // 根据ID加载景点详情

    // 更新页面标题为店铺名称
    wx.setNavigationBarTitle({
      title: this.data.spot.name || "详情"
    });

    // 从本地存储中获取收藏的ID列表
    const favoriteSpotIds = wx.getStorageSync('favoriteSpotIds') || [];
    const isCollected = favoriteSpotIds.includes(spotId);
    this.setData({
      collected: isCollected
    });
  },

  // 根据景点ID加载详情
  loadSpotDetail: function (id) {
    // 模拟获取景点数据（可以替换为网络请求）
    const spot = mockData.scenicSpots.find(spot => spot.id == id);
    if (spot) {
      const imageCdn = 'https://tdesign.gtimg.com/mobile/demos';
      // 添加示例图片URL
      spot.images = [
        `${imageCdn}/swiper1.png`,
        `${imageCdn}/swiper2.png`,
        `${imageCdn}/swiper1.png`,
        `${imageCdn}/swiper2.png`,
        `${imageCdn}/swiper1.png`,
        `${imageCdn}/swiper2.png`,
        `${imageCdn}/swiper1.png`,
      ];
      this.setData({
        spot: spot
      });
    }
  },

  // 收藏/取消收藏
  onCollectToggle: function () {
    const spotId = this.data.spot.id;
    let favoriteSpotIds = wx.getStorageSync('favoriteSpotIds') || [];

    if (favoriteSpotIds.includes(spotId)) {
      favoriteSpotIds = favoriteSpotIds.filter(id => id !== spotId);
      this.setData({ collected: false });
    } else {
      favoriteSpotIds.push(spotId);
      this.setData({ collected: true });
    }

    wx.setStorageSync('favoriteSpotIds', favoriteSpotIds);
    wx.showToast({
      title: this.data.collected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  // 导航到店铺
  onNavigate: function () {
    const { latitude, longitude } = this.data.spot;
    wx.openLocation({
      latitude,
      longitude,
      scale: 15,
      name: this.data.spot.name,
      address: this.data.spot.address
    });
  },

  // 处理图片点击事件
  onImageClick: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentImageIndex: index
    });
  }
});
