// components/tab-bar/tab-bar.js
Component({
  properties: {},
  data: {
    activePage: '' // 用于存储当前激活的页面标识
  },
  lifetimes: {
    attached: function () {
      // 获取当前页面栈，取最后一个页面路径
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1].route;

      // 根据当前页面路径设置 activePage
      if (currentPage.includes('explore')) {
        this.setData({
          activePage: 'explore'
        });
      } else if (currentPage.includes('map')) {
        this.setData({
          activePage: 'map'
        });
      } else if (currentPage.includes('my')) {
        this.setData({
          activePage: 'my'
        });
      }
    }
  },
  methods: {}
});
