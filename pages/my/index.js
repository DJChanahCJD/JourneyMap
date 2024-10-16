const mockData = require('../../data/mockData.js')
Page({
    data: {
        useMockData: true, // 是否使用模拟数据，便于切换到真实API
        cityCount: 0, // 用户所探索的城市数量
        spotCount: 0, // 用户收藏的景点数量
        wishlist: [], // 用户的心愿单（收藏的景点）
        avatarUrl: '/resources/default-avatar.png', // 默认头像
        nickName: '未设置昵称' // 用户昵称
    },

    onLoad() {
      this.fetchUserData(); // 加载用户信息和心愿单
      this.getUserProfile(); // 获取用户微信头像
    },

    fetchUserData() {
      const favoriteSpotIds = wx.getStorageSync('favoriteSpotIds') || [];
      if (this.data.useMockData) {
        // 使用模拟数据
        const mockUserData = {
          cityCount: 165,
          spotCount: 972,
          wishlist: mockData.scenicSpots.filter(spot => favoriteSpotIds.includes(spot.id))
        };
        this.setData({
          cityCount: mockUserData.cityCount,
          spotCount: mockUserData.spotCount,
          wishlist: mockUserData.wishlist
        });
      } else {
        // 使用API获取用户信息和心愿单数据
        wx.request({
          url: 'https://api.example.com/getUserData',
          method: 'GET',
          success: (res) => {
            this.setData({
              cityCount: res.data.cityCount,
              spotCount: res.data.spotCount,
              wishlist: res.data.wishlist
            });
          },
          fail: (err) => {
            console.error('Error fetching user data:', err);
          }
        });
      }
    },

    getUserProfile() {
      // 调用微信接口获取用户头像和昵称
      wx.getUserProfile({
        desc: '用于完善个人资料',
        success: (res) => {
          this.setData({
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName
          });
        },
        fail: (err) => {
          console.error('Error getting user profile:', err);
        }
      });
    }
  });
