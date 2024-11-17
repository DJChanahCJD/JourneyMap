// components/top-bar/top-bar.js
Component({
  properties: {},
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
  },
  methods: {},
  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync();
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();

      // 计算导航栏高度
      const statusBarHeight = systemInfo.statusBarHeight + 5;
      const navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height;

      this.setData({
        statusBarHeight,
        navBarHeight
      });
    }
  }
});
