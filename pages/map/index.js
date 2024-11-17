import cloudbase from "@cloudbase/js-sdk/app";
import { registerAuth } from "@cloudbase/js-sdk/auth";
import { registerAi } from "@cloudbase/js-sdk/ai";
import AMap from '../../api/amap-wx.js';
import { getSpots, getFavoriteSpotIds, getCategories } from '../../api/spot';

const app = getApp();
Page({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    }
  },
  data: {
    appId: 'wx8abaf00ee8c3202e',
    extraData: {
      id: "672493",
      customData: {} // 自定义参数，具体参考文档
    },
    iconPath: '/resources/map-marker.png',
    selectedIconPath: '/resources/map-marker-selected.png',
    collectedIconPath: '/resources/map-marker-collected.png',
    iconWidth: 30,
    iconHeight: 30,
    latitude: 39.916527, // 默认纬度（北京市）
    longitude: 116.397128, // 默认经度（北京市）
    markers: [], // 标记点数组
    selectedCategory: '分类', // 新增数据，保存当前选择的景点类型
    categoryList: ['全部'], // 景点类型列表
    selectedSpot: null, // 保存当前选中的景点
    isShow: true,
    messages: [],
    inputContent: '',
    spots: [],
    favoriteSpotIds: [],
    amapKey: '96e3eef9050ea0c7d8e12ab8c541f395', // 高德地图API Key
  },

  async onLoad() {
    // 等待用户信息加载完成
    await new Promise((resolve) => {
      const checkUserInfo = setInterval(() => {
        if (app.globalData.userInfo?.userId) {
          clearInterval(checkUserInfo);
          resolve();
        }
      }, 100);
    });

    const userId = app.globalData.userInfo.userId;

    // 并行请求数据
    const [favoriteSpotIds, spots, categoryList] = await Promise.all([
      getFavoriteSpotIds(userId),
      getSpots(),
      getCategories()
    ]);

    console.log("favoriteSpotIds from map: ", favoriteSpotIds);

    // 一次性更新数据
    this.setData({
      favoriteSpotIds: favoriteSpotIds,
      spots: spots.map(spot => {
        return {
          ...spot,
          iconPath: this.data.iconPath
        };
      }),
      categoryList: ['全部', ...categoryList]
    });

    this.data.spots.forEach(spot => {
      console.log("spot id: ", spot.id, typeof spot.id);
      spot.id = parseInt(spot.id, 10);
      console.log("spot id: ", spot.id, typeof spot.id);

    });

    app.globalData.favoriteSpotIds = this.data.favoriteSpotIds;

    // 初始化地图
    this.amapInstance = new AMap.AMapWX({ key: this.data.amapKey });
    this.getUserLocation();
  },

  onShow() {
    this.setData({
      favoriteSpotIds: app.globalData.favoriteSpotIds,
      isShow: false,
    });
    console.log("onShow selectedSpot wx.getStorageSync: ", this.data.selectedSpot);
    console.log("selectedSpot: ", this.data.selectedSpot);
    console.log("favoriteSpotIds: ", this.data.favoriteSpotIds);
    this.setData({
      isShow: true,
      markers: this.data.markers.map(marker => {
        if (marker.id === this.data.selectedSpot.id) {
          marker.width = this.data.iconWidth * 1.2;
          marker.height = this.data.iconHeight * 1.2;
          marker.iconPath = this.data.selectedIconPath;
        } else {
          marker.width = this.data.iconWidth;
          marker.height = this.data.iconHeight;
          marker.iconPath = this.data.iconPath;
        }
        if (this.data.favoriteSpotIds.includes(marker.id)) {
          marker.iconPath = this.data.collectedIconPath;
        }
        return marker;
      }),
    });
  },

  handleFavoriteUpdate: function (e) {
    const { spotId, favoriteSpotIds } = e.detail;
    console.log("handleFavoriteUpdate: ", spotId, favoriteSpotIds);

    // 更新收藏列表
    this.setData({ favoriteSpotIds });

    // 找到需要更新的marker的索引
    const markerIndex = this.data.markers.findIndex(marker => marker.id === spotId);
    console.log("updateMarkerIndex: ", markerIndex);
    // 如果找到对应的marker，只更新这一个marker的图标
    if (markerIndex !== -1) {
        this.setData({
            [`markers[${markerIndex}].iconPath`]: favoriteSpotIds.includes(spotId)
                ? this.data.collectedIconPath
                : this.data.selectedIconPath
        });
    }
  },

  getUserLocation: function () {
    var that = this;
    // 先确保spots数据格式正确
    const formattedSpots = this.data.spots.map(spot => ({
      ...spot,
      latitude: parseFloat(spot.latitude),
      longitude: parseFloat(spot.longitude)
    }));

    this.setData({ spots: formattedSpots });

    this.amapInstance.getRegeo({
      success: (res) => {
        console.log("res: ", res);
        if (res && res.length > 0) {
          that.setData({
            latitude: res[0].latitude,
            longitude: res[0].longitude
          });
        }
      },
      fail: (err) => {
        console.log("获取位置失败: ", err);
        // 即使获取位置失败，也要显示景点标记
        this.setSpots(formattedSpots);
      }
    });
    // 保证在获取失败也能使用默认位置
    this.setSpots(formattedSpots);
    this.findNearestSpot({
      latitude: this.data.latitude,
      longitude: this.data.longitude
    });
  },

  setSpots(spots) {
    console.log("setSpots开始执行，spots数量:", spots.length);
    const markers = spots.map(spot => {
      const marker = {
        id: parseInt(spot.id),
        latitude: parseFloat(spot.latitude),
        longitude: parseFloat(spot.longitude),
        title: spot.name,
        iconPath: this.data.favoriteSpotIds.includes(parseInt(spot.id))
          ? this.data.collectedIconPath
          : this.data.iconPath,
        width: this.data.iconWidth,
        height: this.data.iconHeight
      };
      console.log("创建marker:", marker);
      return marker;
    });

    this.setData({
      markers: markers
    }, () => {
      console.log("markers设置完成，数量:", markers.length);
    });
  },

  findNearestSpot: function (userLocation) {
    // 找到最近的景点
    const spots = this.data.spots;
    let nearestSpot = null;
    let minDistance = Number.MAX_VALUE;

    spots.forEach(spot => {
      const distance = this.calculateDistance(userLocation, spot);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSpot = spot;
      }
    });
    if (nearestSpot) {
      // 设置最近景点为选中状态
      this.setData({
        markers: this.data.markers.map(marker => {
          if (marker.id === nearestSpot.id) {
            marker.width = this.data.iconWidth * 1.2;
            marker.height = this.data.iconHeight * 1.2;
            marker.iconPath = this.data.selectedIconPath;
          } else {
            marker.width = this.data.iconWidth;
            marker.height = this.data.iconHeight;
            marker.iconPath = this.data.iconPath;
          }
          if (this.data.favoriteSpotIds.includes(marker.id)) {
            marker.iconPath = this.data.collectedIconPath;
          }
          return marker;
        }),
        selectedSpot: nearestSpot
      });
      console.log("最近的景点: ", nearestSpot);
    }
  },

  calculateDistance: function (point1, point2) {
    // 使用 Haversine 公式计算两点之间的距离（单位：公里）
    const R = 6371; // 地球半径，单位为公里
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距离（公里）
  },

  deg2rad: function (deg) {
    return deg * (Math.PI / 180);
  },

  // 点击分类按钮
  onCategoryChange: function (e) {
    const selectedCategoryIndex = e.detail.value;
    const selectedCategory = this.data.categoryList[selectedCategoryIndex];
    this.setData({
      selectedCategory: selectedCategory
    }, () => {
      this.updateMarkers();
    });
  },

  // 更新地图标记
  updateMarkers: function () {
    const filteredSpots = this.data.spots.filter(spot => {
      return this.data.selectedCategory === '全部' || spot.category === this.data.selectedCategory;
    });

    this.setSpots(filteredSpots);
  },

  // 点击标记
  onMarkerTap: function (e) {
    if (e.markerId === this.data.selectedMarkerId) return;
    console.log("e: ", e);
    const markerId = e.markerId;
    const selectedSpot = this.data.spots.find(spot => spot.id === markerId);
    console.log("spotid: ", this.data.spots[0].id, typeof this.data.spots[0].id);
    console.log("markerid: ", markerId, typeof markerId);
    console.log("onMarkerTap selectedSpot: ", selectedSpot);
    if (selectedSpot) {
      this.setData({
        markers: this.data.markers.map(marker => {
          if (marker.id === markerId) {
            marker.width = this.data.iconWidth * 1.2;
            marker.height = this.data.iconHeight * 1.2;
            marker.iconPath = this.data.selectedIconPath;
          } else {
            marker.width = this.data.iconWidth;
            marker.height = this.data.iconHeight;
            marker.iconPath = this.data.iconPath;
          }
          if (this.data.favoriteSpotIds.includes(marker.id)) {
            marker.iconPath = this.data.collectedIconPath;
          }
          return marker;
        }),
        selectedSpot: selectedSpot
      })
    }
    console.log("selectedSpot: ", this.data.selectedSpot);
  },

  navigateToFeedback: function () {
    wx.openEmbeddedMiniProgram({
      appId: this.data.appId,
      extraData: this.data.extraData,
      allowFullScreen: true,
      success: () => {
        console.log('成功打开嵌入小程序');
      },
      fail: (err) => {
        console.error('打开嵌入小程序失败', err);
      }
    });
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
  },

  // Ai弹窗
  onAIButtonTap(e) {
    this.setData({ visible: true });
  },
  onVisibleChange(e) {
    this.setData({ visible: e.detail.visible });
  },
  handlePopup() {
    this.setData({ visible: true });
  },
  closeDialog() {
    this.setData({ visible: false });
  },
  confirmAction() {
    this.setData({ visible: false });
  },

  async sendMessage() {
    // 使用 wx.createSelectorQuery 获取输入框的内容
    const query = wx.createSelectorQuery();
    query.select('.input-field').fields({ properties: ['value'] }, (res) => {
      if (res && res.value) {
        const userMessage = res.value.trim();
        if (!userMessage) return;

        // 将用户消息添加到对话中
        this.setData({
          messages: [...this.data.messages, { role: 'user', content: userMessage }]
        });

        // 清空输入框
        this.setData({ inputContent: '' });

        // 后续 AI 处理逻辑
        this.handleAIMessage(userMessage);
      }
    }).exec();
  },

  // 处理AI消息
  async handleAIMessage(userMessage) {
    try {
      // 初始化 CloudBase 环境，登录，调用AI模型生成文本（代码与之前相同）
      const envId = "journeymap-8guldi1x22f48179";
      registerAuth(cloudbase);
      registerAi(cloudbase);
      const app = cloudbase.init({ env: envId });

      const auth = app.auth({ persistence: "local" });
      await auth.signInWithOpenId(); // 或者使用其他登录方式
      const ai = await app.ai();
      const aiModel = ai.createModel("zhipu");

      // 向对话中添加一个空的AI消息
      this.setData({
        messages: [...this.data.messages, { role: 'ai', content: '' }]
      });

      // 调用 AI 模型进行文本生成
      const res = await aiModel.streamText({
        model: "glm-4-flash",
        messages: [{ role: "user", content: userMessage }]
      });

      let aiContent = '';
      for await (let str of res.textStream) {
        aiContent += str;
        // 更新最后一条AI消息的内容
        this.setData({
          messages: this.data.messages.map((message, index) => {
            if (index === this.data.messages.length - 1) {
              return { ...message, content: aiContent};
            }
            return message;
          })
        });
      }
    } catch (err) {
      console.error("AI 生成失败:", err);
      wx.showToast({
        title: 'AI 生成失败，请重试',
        icon: 'none'
      });
    }
  },

});
