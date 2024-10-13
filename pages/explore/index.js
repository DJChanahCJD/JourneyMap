Page({
    data: {
      useMockData: true, // 是否使用模拟数据，便于切换到真实API
      cityList: [], // 城市列表
      typeList: [], // 景点类型列表
      selectedCity: '北京',
      selectedType: '全部类型',
      spots: [] // 景点数据列表
    },
  
    onLoad() {
      this.fetchCityAndTypeData(); // 加载时获取城市和类型列表
      this.fetchSpotData(); // 加载景点数据
    },
  
    fetchCityAndTypeData() {
      if (this.data.useMockData) {
        // 使用模拟数据
        const mockCityList = ['北京', '上海', '广州', '深圳'];
        const mockTypeList = ['全部类型', '文化景点', '自然景点', '历史遗迹'];
        this.setData({
          cityList: mockCityList,
          typeList: mockTypeList
        });
      } else {
        // 使用API获取城市和类型数据
        wx.request({
          url: 'https://api.example.com/getCityAndTypes',
          method: 'GET',
          success: (res) => {
            this.setData({
              cityList: res.data.cityList,
              typeList: res.data.typeList
            });
          },
          fail: (err) => {
            console.error('Error fetching city and type data:', err);
          }
        });
      }
    },
  
    fetchSpotData() {
      if (this.data.useMockData) {
        // 使用模拟数据
        const mockSpots = [
          {
            id: 1,
            image: '/resources/spot.png',
            name: '天安门广场',
            tags: '文化景点',
            hours: '06:00-22:00',
            address: '北京市东城区...',
            isCollected: false
          },
          {
            id: 2,
            image: '/resources/spot.png',
            name: '颐和园',
            tags: '自然景点',
            hours: '07:00-19:00',
            address: '北京市海淀区...',
            isCollected: true
          },
          {
            id: 3,
            image: '/resources/spot.png',
            name: '长城',
            tags: '历史遗迹',
            hours: '全天开放',
            address: '北京市延庆区...',
            isCollected: false
          }
        ];
        this.setData({
          spots: mockSpots
        });
      } else {
        // 使用API获取景点数据
        wx.request({
          url: 'https://api.example.com/getSpots',
          method: 'GET',
          data: {
            city: this.data.selectedCity,
            type: this.data.selectedType
          },
          success: (res) => {
            this.setData({
              spots: res.data.spots
            });
          },
          fail: (err) => {
            console.error('Error fetching spots data:', err);
          }
        });
      }
    },
  
    onCityChange(e) {
      this.setData({
        selectedCity: this.data.cityList[e.detail.value]
      }, () => {
        this.fetchSpotData(); // 更新城市后重新加载景点数据
      });
    },
  
    onTypeChange(e) {
      this.setData({
        selectedType: this.data.typeList[e.detail.value]
      }, () => {
        this.fetchSpotData(); // 更新类型后重新加载景点数据
      });
    },
  
    toggleCollect(e) {
      const id = e.currentTarget.dataset.id;
      const updatedSpots = this.data.spots.map(spot => {
        if (spot.id === id) {
          spot.isCollected = !spot.isCollected;
        }
        return spot;
      });
      this.setData({ spots: updatedSpots });
    }
  });
  