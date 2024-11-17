// components/spot-card/spot-card.js
const app = getApp();
const AMapWX = require('../../api/amap-wx.js').AMapWX;

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
      // 尝试获取缓存的位置信息
      const app = getApp();
      const cachedLocation = {
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude
      };

      if (cachedLocation.latitude && cachedLocation.longitude) {
        // 使用缓存的位置信息计算距离
        this.calculateDistanceWithLocation(cachedLocation);
      } else {
        // 如果没有缓存，使用 IP 定位
        const amapInstance = new AMapWX({
          key: getApp().globalData.amapKey
        });

        amapInstance.getRegeo({
          success: (data) => {
            console.log('IP定位成功:', data);
            if (data && data[0]) {
              const currentLocation = {
                latitude: data[0].latitude,
                longitude: data[0].longitude
              };
              // 缓存位置信息
              app.updateLocation(currentLocation.latitude, currentLocation.longitude);
              // 计算距离
              this.calculateDistanceWithLocation(currentLocation);
            }
          },
          fail: (error) => {
            console.error('IP定位失败:', error);
            this.setData({
              ['formattedSpot.distance']: '未知'
            });
          }
        });
      }
    },

    calculateDistanceWithLocation(currentLocation) {
      const amapInstance = new AMapWX({
        key: getApp().globalData.amapKey
      });

      amapInstance.getDrivingRoute({
        origin: `${currentLocation.longitude},${currentLocation.latitude}`,
        destination: `${this.data.spot.longitude},${this.data.spot.latitude}`,
        success: (data) => {
          if (data && data.paths && data.paths[0]) {
            const distance = data.paths[0].distance;
            this.setData({
              ['formattedSpot.distance']: this.formatDistance(parseFloat(distance))
            });
          }
        },
        fail: (error) => {
          console.error('距离计算失败:', error);
          this.setData({
            ['formattedSpot.distance']: '未知'
          });
        }
      });
    },

    formatDistance(distance) {
      if (distance >= 1000) {
        return (distance / 1000).toFixed(1) + 'km';
      }
      return Math.round(distance) + 'm';
    },

    // 修改数据格式转换方法
    formatSpotData(spot) {
      return {
        id: spot.id,
        name: spot.name,
        image: spot.imagesURL ? spot.imagesURL[0] : '',
        tags: spot.taglist || [],
        recommendation: spot.recomendation,
        hours: spot.openTime,
        address: spot.location,
        latitude: parseFloat(spot.latitude),
        longitude: parseFloat(spot.longitude),
        distance: this.data.distance // 保持原有的距离计算
      };
    }
  }
});
