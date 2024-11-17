import { updateUserInfo, uploadAvatar } from '../../api/user';
import FormData from '../../utils/formData';
import { baseUrl } from '../../api/baseUrl';
const app = getApp();
Page({
  data: {
    userInfo: {
      avatar: '',
      userId: '',
      nickName: '',
      avatarChanged: false
    }
  },

  onLoad(options) {
    // 确保全局数据存在
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: {
          avatar: app.globalData.userInfo.avatar || '/resources/default-avatar.png',
          userId: app.globalData.userInfo.userId,
          nickName: app.globalData.userInfo.nickName || '旅行者',
        }
      });
    } else {
      console.error('全局用户信息不存在');
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      // 可以选择返回上一页
      wx.navigateBack();
    }
  },

  // 最终提交保存
  async tapSave() {
    try {
      // 如果头像有变化，先上传头像
      if (this.data.userInfo.avatarChanged) {
        const formData = new FormData();
        // 添加头像文件
        formData.appendFile('file', this.data.userInfo.avatar, 'avatar.jpg');

        const data = formData.getData();

        // 发起上传请求
        const uploadResult = await new Promise((resolve, reject) => {
          wx.request({
            url: `${baseUrl}/user/updateavatar?uuid=${this.data.userInfo.userId}`,
            method: 'POST',
            header: {
              'content-type': data.contentType
            },
            data: data.buffer,
            success: (res) => {
              console.log('uploadAvatar res:', res);
              if (res.data.code === 200) {
                resolve(res.data.data);
              } else {
                reject(new Error(res.data.msg || '头像上传失败'));
              }
            },
            fail: reject
          });
        });

        // 更新头像URL并重置更改标记
        this.setData({
          ['userInfo.avatar']: uploadResult.url,
          ['userInfo.avatarChanged']: false
        });
      }

      // 更新用户信息
      const res = await updateUserInfo(this.data.userInfo);

      console.log('updateUserInfo res:', res);
      if (res.code === 200) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        //更新全局用户信息
        app.globalData.userInfo.avatar = this.data.userInfo.avatar;
        app.globalData.userInfo.nickName = this.data.userInfo.nickName;
        wx.switchTab({ url: '/pages/my/index' });
      } else {
        throw new Error(res.message || '保存失败');
      }
    } catch (error) {
      console.error('更新失败:', error);
      wx.showToast({
        title: error.message || '网络错误，请稍后重试',
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
    // 直接使用临时文件路径
    this.setData({
      ['userInfo.avatar']: avatarUrl,
      ['userInfo.avatarChanged']: true
    });
  },

  // // 获取用户信息
  // async getUserInfo() {
  //   if (!this.data.userInfo.userId) {
  //     console.log('用户ID不存在，跳过获取用户信息');
  //     return;
  //   }

  //   try {
  //     const res = await getUserInfo(this.data.userInfo.userId);
  //     console.log('getUserInfo res:', res);
  //     if (res.code === 200) {
  //       this.setData({
  //         userInfo: {
  //           ...this.data.userInfo,
  //           avatar: res.data.avatarUrl || this.data.userInfo.avatar,
  //           nickName: res.data.name || this.data.userInfo.nickName,
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     console.error('获取用户信息失败:', error);
  //   }
  // }
});