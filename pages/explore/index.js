const mockData = require('../../data/mockData.js');

Page({
    data: {
        useMockData: true, // 是否使用模拟数据，便于切换到真实API
        typeList: ['全部类型', '文化', '自然', '历史', '艺术', '娱乐', '科技'],
        selectedProvince: '全部省份',
        selectedCity: '全部城市',
        selectedType: '全部类型',
        spots: [], // 景点数据列表
        regionValue: [] // 省份和城市选择器的初始值
    },

    onLoad() {
        // 获取本地存储的收藏状态
        const storedSpots = wx.getStorageSync('scenicSpots');
        if (storedSpots && storedSpots.length > 0) {
            this.setData({ spots: storedSpots });
        } else {
            this.fetchSpotData(); // 加载景点数据
        }
    },

    /**
     * 处理区域选择变化
     * @param {Object} e - 事件对象
     */
    onRegionChange(e) {
        const { value, code, postcode } = e.detail;

        // 检查是否选择了自定义的“全部省份”
        if (value[0] === '全部省份') {
            this.setData({
                selectedProvince: '全部省份',
                selectedCity: '全部城市',
                regionValue: value
            }, () => {
                this.fetchSpotData(); // 更新区域后重新加载景点数据
            });
        } else {
            // 获取实际选择的省份和城市
            let selectedProvince = value[0];
            let selectedCity = value[1] || '全部城市';
            this.setData({
                selectedProvince: selectedProvince,
                selectedCity: selectedCity,
                regionValue: value
            }, () => {
                this.fetchSpotData(); // 更新区域后重新加载景点数据
            });
        }
    },

    /**
     * 处理类型选择变化
     * @param {Object} e - 事件对象
     */
    onTypeChange(e) {
        const selectedType = this.data.typeList[e.detail.value];
        this.setData({
            selectedType: selectedType
        }, () => {
            this.fetchSpotData(); // 更新类型后重新加载景点数据
        });
    },

    /**
     * 获取景点数据，可以选择使用模拟数据或通过API获取
     */
    fetchSpotData() {
        if (this.data.useMockData) {
            let filteredSpots = mockData.scenicSpots;

            // 根据选择的省份进行筛选
            if (this.data.selectedProvince !== '全部省份') {
                filteredSpots = filteredSpots.filter(spot => spot.province === this.data.selectedProvince);
            }

            // 根据选择的城市进行筛选
            if (this.data.selectedCity !== '全部城市') {
                filteredSpots = filteredSpots.filter(spot => spot.city === this.data.selectedCity);
            }

            // 根据选择的类型进行筛选
            if (this.data.selectedType !== '全部类型') {
                filteredSpots = filteredSpots.filter(spot => spot.type === this.data.selectedType);
            }

            this.setData({
                spots: filteredSpots
            });
        } else {
            // 使用API获取景点数据
            wx.request({
                url: 'https://api.example.com/getSpots',
                method: 'GET',
                data: {
                    province: this.data.selectedProvince,
                    city: this.data.selectedCity,
                    type: this.data.selectedType
                },
                success: (res) => {
                    if (res.statusCode === 200 && res.data && Array.isArray(res.data.spots)) {
                        this.setData({
                            spots: res.data.spots
                        });
                    } else {
                        console.error('Unexpected response structure:', res);
                        wx.showToast({
                            title: '数据加载失败',
                            icon: 'none'
                        });
                    }
                },
                fail: (err) => {
                    console.error('Error fetching spots data:', err);
                    wx.showToast({
                        title: '网络错误，请稍后重试',
                        icon: 'none'
                    });
                }
            });
        }
    },

    /**
     * 导航到景点详情页面
     * @param {Object} e - 事件对象
     */
    navigateToDetail(e) {
        const id = e.currentTarget.dataset.id;
        if (id) {
            wx.navigateTo({
                url: `/pages/detail/index?id=${id}`
            });
        } else {
            wx.showToast({
                title: '无效的景点ID',
                icon: 'none'
            });
        }
    },

    /**
     * 切换景点的收藏状态
     * @param {Object} e - 事件对象
     */
    toggleCollect(e) {
        const id = e.currentTarget.dataset.id;
        if (!id) {
            wx.showToast({
                title: '无效的景点ID',
                icon: 'none'
            });
            return;
        }

        const updatedSpots = this.data.spots.map(spot => {
            if (spot.id === id) {
                return { ...spot, isCollected: !spot.isCollected };
            }
            return spot;
        });

        this.setData({ spots: updatedSpots }, () => {
            // 将收藏状态保存到本地
            wx.setStorageSync('scenicSpots', updatedSpots);
        });
    },

    /**
     * （可选）保存收藏状态
     * @param {string|number} id - 景点ID
     * @param {boolean} isCollected - 收藏状态
     */
    // saveCollectionStatus(id, isCollected) {
    //     // 实现收藏状态的保存逻辑，例如调用API或使用本地存储
    // }
});
