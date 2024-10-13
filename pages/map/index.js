Page({
    data: {
      subkey: 'VFWBZ-H44E4-6HAUY-K2THD-BMFJ7-2WFRF',
      latitude: 39.916527, // 默认纬度（北京市）
      longitude: 116.397128, // 默认经度（北京市）
      markers: [], // 标记点数组
      scenicSpots: [ 
        { 
            id: 1, 
            name: "故宫博物院", 
            latitude: 39.916344, 
            longitude: 116.397155, 
            iconPath: "/resources/marker.png", 
            width: 30, 
            height: 30 
        }, 
        { 
            id: 2, 
            name: "天安门广场", 
            latitude: 39.908722, 
            longitude: 116.397499, 
            iconPath: "/resources/marker.png", 
            width: 30, 
            height: 30 
        } 
        ], 
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
      this.setData({ 
        markers: this.data.scenicSpots.map(spot => ({ 
          id: spot.id, 
          latitude: spot.latitude, 
          longitude: spot.longitude, 
          title: spot.name, 
          iconPath: spot.iconPath, 
          width: spot.width, 
          height: spot.height 
        })) 
      }); 
    }, 
   
    onMarkerTap: function (e) { 
      const markerId = e.markerId; 
      const selectedSpot = this.data.scenicSpots.find(spot => spot.id === markerId); 
      if (selectedSpot) { 
        wx.showToast({ 
          title: selectedSpot.name, 
          icon: 'none' 
        }); 
        // TODO: 跳转到详情页 
      } 
    }
  });
  