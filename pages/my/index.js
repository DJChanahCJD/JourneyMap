// pages/my/index.js

const app = getApp();
const { getSpots, recommendSpot } = require('../../api/spot');
const { getUserInfo } = require('../../api/user');
const { baseUrl } = require('../../api/baseUrl');
const FormData = require('../../utils/formData.js');

Page({
    data: {
        cityCount: 13, // 用户所探索的城市数量
        spotCount: 123, // 用户收藏的景点数量
        userInfo: {
          avatar: '/resources/default-avatar.png', // 默认头像
          nickName: null, // 用户昵称
        },
        spots: [],
        favoriteSpotIds: [],
        favoriteSpots: [],
        spotName: '',
        category: '',
        categoryText: '',
        categoryValue: [],
        categoryVisible: false,
        categories: [],
        tags: [],
        selectedTags: [], // 存储选中的标签值，使用数字
        description: '',
        location: '',
        fileList: [],
        uploadConfig: {
          max: 2 * 1024 * 1024, // 2MB
          sizeType: ['compressed'],
          sourceType: ['album', 'camera']
        }
    },


    async onLoad() {
      const spots = await getSpots();
      // 确保 spots 中的 id 都是数字类型
      const formattedSpots = spots.map(spot => ({
        ...spot,
        id: parseInt(spot.id, 10)
      }));

      this.setData({
        spots: formattedSpots
      }, () => {
        this.fetchUserData();
      });

      this.setData({
        userInfo: app.globalData.userInfo,
        spotCount: spots.length,
        cityCount: spots.map(spot => spot.province)
          .filter((value, index, self) => self.indexOf(value) === index)
          .length,
        tags: app.globalData.tags,
        categories: app.globalData.categories.map(category => ({
          label: category,
          value: category
        }))
      });
    },

    onShow() {
      this.fetchUserData();
    },

    fetchUserData() {
      const favoriteSpotIds = app.globalData.favoriteSpotIds || [];
      console.log("favoriteSpotIds from my page: ", favoriteSpotIds);

      // 确保 favoriteSpotIds 中的 id 都是数字类型
      const numericFavoriteIds = favoriteSpotIds.map(id => parseInt(id, 10));

      // 过滤收藏的景点
      const favoriteSpots = this.data.spots.filter(spot =>
        numericFavoriteIds.includes(parseInt(spot.id, 10))
      );

      console.log("Filtered favoriteSpots:", favoriteSpots);

      this.setData({
        userInfo: app.globalData.userInfo,
        favoriteSpotIds: numericFavoriteIds,
        favoriteSpots: favoriteSpots
      });
    },

    handleAdd(e) {
      const { files } = e.detail;
      const validFiles = files.filter(file => {
        if (file.size > 2 * 1024 * 1024) {
          wx.showToast({ title: '图片大小不能超过2MB', icon: 'none' });
          return false;
        }
        return true;
      });

      this.setData({
        fileList: [...this.data.fileList, ...validFiles]
      });
    },

    handleRemove(e) {
      const { index } = e.detail;
      const { fileList } = this.data;
      fileList.splice(index, 1);
      this.setData({ fileList });
    },


    handleFavoriteUpdate(e) {
      const { spotId, favoriteSpotIds } = e.detail;
      console.log("handleFavoriteUpdate: ", spotId, favoriteSpotIds);

      // 更新 favoriteSpotIds 和 favoriteSpots
      const newSpots = this.data.favoriteSpots.filter(spot => favoriteSpotIds.includes(spot.id));

      this.setData({
        favoriteSpotIds: favoriteSpotIds,
        favoriteSpots: newSpots,
      });
    },

    setUserProfile() {
      wx.navigateTo({
        url: '/pages/profile/index',
        fail: (err) => {
          console.error('页面跳转失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    },

    onChooseAvatar(e) {
      const { avatar } = e.detail
      this.setData({
        avatar,
      })
    },

    onVisibleChange(e) {
      console.log("onVisibleChange: ", e);
      this.setData({
        visible: e.detail.visible
      });
    },

    handlePopup(e) {
      this.setData({ visible: true });
    },

    closeForm(e) {
      this.setData({ visible: false });
    },

    confirmAction(e) {
      // 其他操作
      this.setData({ visible: false });
    },

    handleInput(e) {
      // const { field } = e.currentTarget.dataset;
      // this.setData({
      //   [field]: e.detail.value
      // });
      // console.log('field:', field, 'value:', e.detail.value);
      // 不在使用setData，而是使用selectComponent来获取input的值，避免抽搐
    },

    // 选择地点类型的 picker 打开
    onCategoryPicker() {
      this.setData({ categoryVisible: true });
    },

    // 处理 picker 列选择
    onColumnChange(e) {
      console.log('picker pick:', e);
    },

    // picker 确认选择
    onPickerChange(e) {
      const { key } = e.currentTarget.dataset;
      const { value } = e.detail;
      this.setData({
        categoryVisible: false,
        categoryValue: value,
        categoryText: value[0],
        category: value[0],
        [`${key}Visible`]: false,
        [`${key}Value`]: value,
        [`${key}Text`]: value.join(' '),
      });
      wx.showToast({
        title: `已选择: ${this.data.categoryText}`,
        icon: 'success'
      });
    },

    // picker 取消选择
    onPickerCancel() {
      this.setData({ categoryVisible: false });
      wx.showToast({
        title: '取消选择地点类型',
        icon: 'none'
      });
    },

    // 选择地理位置
    chooseLocation() {
      wx.chooseLocation({
        success: (res) => {
          console.log('选择的地理位置：', res);
          this.setData({
            location: res.name
          });
          wx.showToast({
            title: `位置已选择：${res.name}`,
            icon: 'success'
          });
          this.selectComponent('.address-input-field').setData({
            value: res.name
          });
        },
        fail: (err) => {
          console.error('地理位置选择失败：', err);
          wx.showToast({
            title: '地理位置选择失败，请重试',
            icon: 'none'
          });
        }
      });
    },

    /**
   * 处理标签的选中和取消选中
   * @param {Event} e
   */
  onTagChange(e) {
    const tagValue = e.currentTarget.dataset.value;
    let { selectedTags } = this.data;
    const index = selectedTags.indexOf(tagValue);
    if (index > -1) {
      // 已选中，取消选择
      selectedTags.splice(index, 1);
    } else {
      // 未选中，添加选择
      selectedTags.push(tagValue);
    }
    this.setData({
      selectedTags
    });
  },

    // 表单提交
    async submitForm(e) {
      try {
        // 获取并验证表单数据
        const spotNameInput = this.selectComponent('.name-input-field');
        const spotName = spotNameInput ? spotNameInput.data.value : '';
        const description = this.selectComponent('.textarea-field').data.value;
        const location = this.selectComponent('.address-input-field').data.value;
        const { category, selectedTags, fileList } = this.data;

        // 表单验证
        if (!spotName || !category || !selectedTags.length || !description?.trim() || !location || fileList.length === 0) {
          wx.showToast({
            title: '请完整填写所有必填项',
            icon: 'none'
          });
          return;
        }

        // 创建 FormData
        const formData = new FormData();

        // 添加表单数据
        formData.append('uuid', app.globalData.userInfo.userId);
        formData.append('scenicName', spotName);
        formData.append('address', location);
        formData.append('category', category);
        formData.append('content', description);
        formData.append('tags', selectedTags.array);
        selectedTags.forEach(tag => {
          formData.append('tags', tag);
        });
        // 处理多张图片
        for (let i = 0; i < fileList.length; i++) {
          formData.appendFile('file', fileList[i].url, `image_${i}.jpg`);
        }

        // 获取请求数据
        const data = formData.getData();


        // 发送请求 - 确保 baseUrl 是字符串
        console.log('Submit Request Data from my page:', formData.getData()); // 调试用
        wx.request({
          url: `${baseUrl}/audit/postAuditItem`,
          method: 'POST',
          header: {
            'content-type': data.contentType  // 使用 FormData 生成的 contentType
          },
          data: data.buffer,
          success: (res) => {
            if (res.data.code === 200) {
              wx.showToast({ title: '提交成功', icon: 'success' });
              this.resetForm();
            } else {
              throw new Error(res.data.msg || '提交失败');
            }
          },
          fail: (error) => {
            console.error('提交失败:', error);
            wx.showToast({ title: '提交失败，请重试', icon: 'none' });
          }
        });

      } catch (error) {
        console.error('提交失败:', error);
        wx.showToast({
          title: error.message || '提交失败，请重试',
          icon: 'none'
        });
      }
    },

    resetForm() {
      this.setData({
        spotName: '',
        category: '',
        categoryText: '',
        selectedTags: [],
        tags: [],
        description: '',
        location: '',
        fileList: [],
        visible: false
      });

      ['name-input-field', 'textarea-field', 'address-input-field'].forEach(selector => {
        const component = this.selectComponent(`.${selector}`);
        if (component) {
          component.setData({ value: '' });
        }
      });
    }
});
