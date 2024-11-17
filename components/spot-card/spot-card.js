// components/spot-card/spot-card.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    spot: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {
        // 确保数据转换
        if (newVal) {
          // 转换数据格式
          const formattedSpot = this.formatSpotData(newVal);
          this.setData({ formattedSpot });
          this.updateCollectedState(formattedSpot);
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isCollected: false,
    formattedSpot: {} // 添加格式化后的数据对象
  },

  lifetimes: {
    attached: function () {
      this.updateCollectedState(this.data.spot);
      this.calculateDistance();
    }
  },

  // 在组件所在页面显示时执行
  pageLifetimes: {
    show: function() {
      console.log("Component show: ", this.data.spot);
      this.updateCollectedState(this.data.spot);
      }
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
      console.log("Update isCollected state with spot.id:", spot.id, "isCollected:", favoriteSpotIds.includes(spot.id));

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

    calculateDistance() {
      // 使用高德地图IP定位API
      wx.request({
        url: `https://restapi.amap.com/v3/ip?key=${getApp().globalData.amapKey}`,
        success: (res) => {
          if (res.data.status === '1') {
            const { rectangle } = res.data;
            // rectangle格式为"左下经度,左下纬度,右上经度,右上纬度"
            const coords = rectangle.split(';')[0].split(',');
            const latitude = (parseFloat(coords[1]) + parseFloat(coords[3])) / 2;
            const longitude = (parseFloat(coords[0]) + parseFloat(coords[2])) / 2;

            // 计算直线距离
            const distance = this.calculateLineDistance(
              latitude,
              longitude,
              this.data.spot.latitude,
              this.data.spot.longitude
            );

            this.setData({
              distance: this.formatDistance(distance)
            });
          }
        }
      });
    },

    // 计算两点之间的直线距离（使用哈弗赛因公式）
    calculateLineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // 地球半径，单位km
      const dLat = this.toRad(lat2 - lat1);
      const dLon = this.toRad(lon2 - lon1);
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c * 1000; // 转换为米
    },

    toRad(value) {
      return value * Math.PI / 180;
    },

    formatDistance(distance) {
      if (distance >= 1000) {
        return (distance / 1000).toFixed(1) + 'km';
      }
      return Math.round(distance) + 'm';
    },

    // 添加数据格式转换方法
    formatSpotData(spot) {
      return {
        id: spot.id,
        name: spot.name,
        image: spot.imagesURL ? spot.imagesURL[0] : '', // 使用第一张图片作为封面
        tags: spot.taglist || [], // 使用taglist作为标签
        recommendation: spot.recomendation, // 注意后端字段拼写
        hours: spot.openTime,
        address: spot.location,
        latitude: parseFloat(spot.latitude),
        longitude: parseFloat(spot.longitude),
        distance: this.data.distance // 保持原有的距离计算
      };
    }
  }
});
