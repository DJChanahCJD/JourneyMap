Page({
    data: {
        extraData :{
            // 把1368数字换成你的产品ID，否则会跳到别的产品
            id : "672493",
            // 自定义参数，具体参考文档
            customData : {
            }
          },
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
      if (this.data.useMockData) {
        // 使用模拟数据
        const mockUserData = {
          cityCount: 165,
          spotCount: 972,
          wishlist: [
            {
              id: 1,
              image: '/resources/spot.png',
              name: '山谷艺术园',
              hours: '09:00-18:00',
              address: '北京市海淀区中关村大街12号'
            },
            {
              id: 2,
              image: '/resources/spot.png',
              name: '天安门广场',
              hours: '06:00-22:00',
              address: '北京市东城区天安门'
            }
          ]
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
  