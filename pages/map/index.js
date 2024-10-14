const mockData = require('../../data/mockData.js');
Page({
    data: {
      appId: 'wx8abaf00ee8c3202e',
      extraData :{
        // 把1368数字换成你的产品ID，否则会跳到别的产品
        id : "672493",
        // 自定义参数，具体参考文档
        customData : {
        }
      },
      iconPath: '/resources/map-marker.png',
      selectedIconPath: '/resources/map-marker-selected.png',
      iconWidth: 30,
      iconHeight: 30,
      subkey: 'VFWBZ-H44E4-6HAUY-K2THD-BMFJ7-2WFRF',
      latitude: 39.916527, // 默认纬度（北京市）
      longitude: 116.397128, // 默认经度（北京市）
      markers: [], // 标记点数组
      selectedType: '分类', // 新增数据，保存当前选择的景点类型
      typeList: ['全部', '文化', '自然', '历史', '艺术', '科技', '娱乐'], // 景点类型列表
      scenicSpots: mockData.scenicSpots, // 景点数据
      selectedSpot: null // 保存当前选中的景点
    },
    onLoad: function() {
      // 获取用户位置
      wx.getLocation({
          type: 'gcj02',
          success: (res) => {
              this.setData({
                latitude: res.latitude,
                longitude: res.longitude
              });
      },
      fail: () => {
          wx.showToast({
          title: '获取位置失败',
          icon: 'none'
          });
      }
      });

      // 设置景点标记
      this.setSpots(this.data.scenicSpots);

      this.mapCtx = wx.createMapContext('map');
      this.mapCtx.initMarkerCluster({
        enableDefaultStyle: true,
        zoomOnClick: true,
        gridSize: 30,
        markers: this.data.markers,
      });
      this.includeAllMarkers();
    },

    setSpots(spots) {
        // 设置景点标记
        this.setData({
          markers: spots.map(spot => ({
            id: spot.id,
            latitude: spot.latitude,
            longitude: spot.longitude,
            title: spot.name,
            iconPath: this.data.iconPath,
            width: this.data.iconWidth,
            height: this.data.iconHeight,
            joinCluster: true,
          }))
      });
    },

    // 包含所有标记点
    includeAllMarkers: function () {
      this.mapCtx.includePoints({
        points: this.data.markers.map(marker => ({
          latitude: marker.latitude,
          longitude: marker.longitude
        })),
        padding: [50, 50, 50, 50],
        success: () => {
          console.log('包含所有标记点成功');
        },
        fail: (err) => {
          console.error('包含所有标记点失败', err);
        }
      });
    },

    // 点击分类按钮
    onTypeChange: function (e) {
      const selectedTypeIndex = e.detail.value;
      const selectedType = this.data.typeList[selectedTypeIndex];
      this.setData({
        selectedType: selectedType
      }, () => {
        this.updateMarkers();
      });
    },

    // 更新地图标记
    updateMarkers: function () {
      const filteredSpots = this.data.scenicSpots.filter(spot => {
        return this.data.selectedType === '全部' || spot.type === this.data.selectedType;
      });

      this.setSpots(filteredSpots);
    },

    // 点击标记
    onMarkerTap: function (e) {
      const markerId = e.markerId;
      const selectedSpot = this.data.scenicSpots.find(spot => spot.id === markerId);
      if (selectedSpot) {
        this.setData({
          markers: this.data.markers.map(marker => {
            marker.iconPath = marker.id === markerId ? this.data.selectedIconPath : this.data.iconPath;
            return marker;
          }),
          selectedSpot: selectedSpot
        })
        // TODO: 跳转到详情页
      }
    },

    navigateToDetail(e) {
      const selectedSpot = this.data.selectedSpot;
      if (selectedSpot) {
          wx.navigateTo({
              url: `/pages/detail/index?id=${selectedSpot.id}`,
          });
      } else {
          wx.showToast({
              title: '请选择一个景点',
              icon: 'none'
          });
      }
  }

  });
