// components/spot-card/spot-card.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    spot: {
      type: Object,
      value: {},  // 默认是一个空对象
      observer: function(newVal, oldVal) {
        if (newVal && newVal.id) {
          this.updateCollectedState(newVal);
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isCollected: false
  },

  lifetimes: {
    attached: function () {
      this.updateCollectedState(this.data.spot);
    }
  },

  onShow() {
    this.updateCollectedState(this.data.spot);
  },


  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 更新收藏状态
     * @param {Object} spot - 景点对象
    */
    updateCollectedState(spot) {
      // 获取本地存储中的收藏 ID 列表
      let favoriteSpotIds = app.globalData.favoriteSpotIds || [];
      console.log("Update isCollected state with spot.id:", spot.id);

      // 更新 isCollected 数据
      this.setData({
        isCollected: favoriteSpotIds.includes(spot.id)
      });
    },
    /**
     * 收藏或取消收藏景点
     * @param {Object} e - 事件对象
     */
    toggleCollect(e) {
      let spotId = e.currentTarget.dataset.id;
      spotId = parseInt(spotId, 10);

      if (isNaN(spotId)) {
        console.error("spotId 未能获取，可能为 undefined 或数据绑定失败");
        return;
      }

      let favoriteSpotIds = app.globalData.favoriteSpotIds || [];
      console.log("favoriteSpotIds: ", favoriteSpotIds);

      if (favoriteSpotIds.includes(spotId)) {
        favoriteSpotIds = favoriteSpotIds.filter(id => id !== spotId);
      } else {
        favoriteSpotIds.push(spotId);
      }
      console.log("updateFavoriteSpotIds: ", favoriteSpotIds);

      app.updateFavoriteSpotIds(favoriteSpotIds);

      // 更新收藏的状态到 data，添加回调确保数据正确设置
      this.setData({
        isCollected: favoriteSpotIds.includes(spotId)
      }, () => {
        console.log("SetData Success: isCollected:", this.data.isCollected);
        // 触发自定义事件，将更新后的 favoriteSpotIds 传递给父页面
        this.triggerEvent('favoriteupdate', {
          spotId: spotId,
          favoriteSpotIds: favoriteSpotIds
        });

      });
    },

  /**
   * 导航到详情页面
   * @param {Object} e - 事件对象
   */
  navigateToDetail(e) {
      const spotId = e.currentTarget.dataset.id; // 获取景点的ID
      console.log("navigateToDetail: ", spotId);
      wx.navigateTo({
          url: `/pages/detail/index?id=${spotId}` // 假设详情页的路径为 pages/spotDetail/spotDetail
      });
  },
  }
});
