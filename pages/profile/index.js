import { getUserInfo, updateUserInfo, uploadAvatar } from '../../api/user';

Page({
  data: {
    userInfo: {
      avatar: '',
      userId: '',
      depositNum: '',
      mobile: '',
      nickName: '',
      waterNum: '',
      avatarChanged: false, // 标记头像是否修改
    }
  },

  onLoad(options) {
    this.getUserInfo();
  },

  // 最终提交保存
  async tapSave() {
    try {
      // 如果头像有变化，先上传头像
      if (this.data.userInfo.avatarChanged) {
        const uploadedAvatarUrl = await uploadAvatar(this.data.userInfo.avatar);
        this.setData({
          ['userInfo.avatar']: uploadedAvatarUrl,
          ['userInfo.avatarChanged']: false // 上传成功后重置标记
        });
      }

      // 更新用户信息
      const res = await updateUserInfo(this.data.userInfo.userId, {
        avatar: this.data.userInfo.avatar,
        nickName: this.data.userInfo.nickName,
      });

      if (res.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'none'
        });
        wx.switchTab({ url: '/pages/my/index' });
      } else {
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      });
    }
  },

  // 输入昵称
  onInput(e) {
    const { value } = e.detail;
    this.setData({
      ['userInfo.nickName']: value
    });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      ['userInfo.avatar']: avatarUrl,
      ['userInfo.avatarChanged']: true // 标记头像已修改
    });
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      const res = await getUserInfo(this.data.userInfo.userId);
      if (res.success) {
        this.setData({
          userInfo: res.data || {}
        });
      } else {
        wx.showToast({
          title: res.message || '获取用户信息失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      });
    }
  }
});
