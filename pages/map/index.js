const mockData = require('../../data/mockData.js');
import cloudbase from "@cloudbase/js-sdk/app";
import { registerAuth } from "@cloudbase/js-sdk/auth";
import { registerAi } from "@cloudbase/js-sdk/ai";

Page({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    }
  },
    data: {
      appId: 'wx8abaf00ee8c3202e',
      extraData :{
        id : "672493",
        // 自定义参数，具体参考文档
        customData : {
        }
      },
      iconPath: '/resources/map-marker.png',
      selectedIconPath: '/resources/map-marker-selected.png',
      collectedIconPath: '/resources/map-marker-collected.png',
      iconWidth: 30,
      iconHeight: 30,
      subkey: 'VFWBZ-H44E4-6HAUY-K2THD-BMFJ7-2WFRF',
      latitude: 39.916527, // 默认纬度（北京市）
      longitude: 116.397128, // 默认经度（北京市）
      markers: [], // 标记点数组
      selectedType: '分类', // 新增数据，保存当前选择的景点类型
      typeList: ['全部', '文化', '自然', '历史', '艺术', '科技', '娱乐'], // 景点类型列表
      scenicSpots: mockData.scenicSpots, // 景点数据
      selectedSpot: null, // 保存当前选中的景点
      messages: [],
      inputContent: ''
    },
    onLoad: async function () {
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

      // 包含所有标记点
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
          iconPath: spot.isCollected ? this.data.collectedIconPath : this.data.iconPath,
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
      if (e.markerId === this.data.selectedMarkerId) return;
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
  }

  });
