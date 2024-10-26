// pages/my/index.js

const app = getApp();
const { getSpots } = require('../../api/spot');

Page({
    data: {
        cityCount: 13, // 用户所探索的城市数量
        spotCount: 123, // 用户收藏的景点数量
        avatarUrl: '/resources/default-avatar.png', // 默认头像
        nickName: null, // 用户昵称
        spots: [],
        favoriteSpotIds: [],
        favoriteSpots: [],
        treasureName: '',
        category: '',
        categoryText: '',
        categoryValue: [],
        categoryVisible: false,
        categories: [
          { label: '自然景观', value: '自然景观' },
          { label: '文化遗址', value: '文化遗址' },
          { label: '美食', value: '美食' },
          { label: '娱乐', value: '娱乐' }
        ],
        tagsOptions: [
          { label: '小众', value: 0 },
          { label: '免费', value: 1 },
          { label: '打卡', value: 2 },
          { label: '摄影', value: 3 },
          { label: '亲子', value: 4 },
          { label: '情侣', value: 5 },
          { label: '必去', value: 6 }
        ],
        tags: [], // 存储选中的标签值，使用数字
        description: '',
        location: '',
        fileList: [],
    },


    async onLoad() {
      console.log("onLoad!!");
      const spots = await getSpots(); // 等待获取到 spots 数据
      this.setData({ spots }, () => {
        // 在 setData 完成后再调用 fetchUserData
        this.fetchUserData();
      });
    },

    onShow() {
      console.log("onShow!!");
      this.fetchUserData();
    },

    fetchUserData() {
      const favoriteSpotIds = app.globalData.favoriteSpotIds || [];
      this.setData({
        favoriteSpotIds: favoriteSpotIds,
        favoriteSpots: this.data.spots.filter(spot => favoriteSpotIds.includes(spot.id))
      });
      console.log("favoriteSpotIds: ", favoriteSpotIds);
      console.log("spots: ", this.data.spots);
      console.log("favoriteSpots: ", this.data.favoriteSpots);
    },

    handleAdd(e) {
      console.log("handleAdd: ", e);
      const { fileList } = this.data;
      const { files } = e.detail;
      this.setData({
        fileList: [...fileList, ...files], // 此时设置了 fileList 之后才会展示选择的图片
      });
    },

    onUpload(file) {
      const { fileList } = this.data;

      this.setData({
        fileList: [...fileList, { ...file, status: 'loading' }],
      });
      const { length } = fileList;

      const task = wx.uploadFile({
        url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
        filePath: file.url,
        name: 'file',
        formData: { user: 'test' },
        success: () => {
          this.setData({
            [`fileList[${length}].status`]: 'done',
          });
        },
      });
      task.onProgressUpdate((res) => {
        this.setData({
          [`fileList[${length}].percent`]: res.progress,
        });
      });
    },
    handleRemove(e) {
      const { index } = e.detail;
      const { fileList } = this.data;

      fileList.splice(index, 1);
      this.setData({
        fileList,
      });
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

    getUserProfile(){
      wx.navigateTo({
        url: '/pages/profile/index',
      });
    },

    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      this.setData({
        avatarUrl,
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
      const { field } = e.currentTarget.dataset;
      this.setData({
        [field]: e.detail.value
      });
      console.log('field:', field, 'value:', e.detail.value);
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
      console.log('picker change:', key, value);
      console.log('categories:', this.data.categories);
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

    // 标签选择处理
    onTagChange(e) {
      this.setData({
        tags: e.detail.value
      });
      console.log('e.detail.value:', e.detail.value);
      console.log('tags:', this.data.tagsOptions);
      console.log('tags:', this.data.tagsOptions[e.detail.value[e.detail.value.length - 1]].label);
    },

    // 表单提交
    submitForm(e) {
      // 将所有选中的标签转换为文本标签数组
      // 在小程序中，我们应该使用this.data来访问数据
      // 如果treasureName为空，我们可以尝试从输入框中获取最新值
      const treasureNameInput = this.selectComponent('.name-input-field');
      this.data.treasureName = treasureNameInput ? treasureNameInput.data.value : '';
      this.data.description = this.selectComponent('.textarea-field').data.value;
      if (!this.data.treasureName) {
        console.warn('地点名称为空，请确保用户已输入');
      } else {
        console.log('地点名称:', this.data.treasureName);
      }

      // 更新this.data中的treasureName
      this.setData({ treasureName: this.data.treasureName });
      const { treasureName, category, tags, description, location } = this.data;
      if (!treasureName || !category || !tags.length || !description || !location || !description.trim()) {
        console.log('treasureName:', treasureName, 'category:', category, 'tags:', tags, 'description:', description, 'location:', location, 'description.trim():', description.trim());
        wx.showToast({
          title: '请完整填写所有必填项',
          icon: 'none'
        });
        return;
      }
      console.log("提交表单...")
      this.data.tags = this.data.tags.map(index => this.data.tagsOptions[index].label);
      console.log('treasureName:', treasureName, 'category:', category, 'tags:', tags, 'description:', description, 'location:', location, 'description.trim():', description.trim());
      wx.showToast({
        title: '表单提交成功',
        icon: 'success'
      });
      this.setData({ visible: false });
    }
});
