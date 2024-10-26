const { getSpotDetail, getFavoriteSpotIds, updateFavoriteSpotIds } = require('../../api/spot');
const { getComments, getUpvotedCommentIds } = require('../../api/comment');
const { formatTime } = require('../../utils/util');
const app = getApp();

Page({
  data: {
    spot: {}, // 保存景点的详细信息
    collected: false, // 是否收藏
    currentImageIndex: 0, // 当前显示的图片索引
    autoplay: false,
    newComment: { content: "", rating: 5 },
    replyingTo: null,
    newReply: "",
    upvotedCommentIds: [],
    currentPage: 1, // 当前评论页码
    pageSize: 10, // 每页评论数
    hasMore: true, // 是否还有更多评论
    sortOptions: ["按热度", "按时间"], // 排序选项
    currentSort: "按热度" // 当前排序方式
  },

  onLoad: function (options) {
    const spotId = parseInt(options.id, 10); // 获取从导航中传来的景点ID
    this.loadSpotDetail(spotId); // 根据ID加载景点详情
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.spot.name || "详情"
    });
  },

  // 页面滚动到底部时触发
  onScrollToLower: function () {
    if (this.data.hasMore) {
      this.loadMoreComments();
    }
  },

  // 根据景点ID加载详情
  loadSpotDetail: async function (id) {
    const spot = await getSpotDetail(id);
    if (spot) {
      spot.images = spot.images || [
        "https://imgtg-12w.pages.dev/file/17d1715f4d25eb8dac62b.jpg",
        "https://imgtg-12w.pages.dev/file/17d1715f4d25eb8dac62b.jpg",
        "https://imgtg-12w.pages.dev/file/17d1715f4d25eb8dac62b.jpg",
        "https://imgtg-12w.pages.dev/file/17d1715f4d25eb8dac62b.jpg"
      ];
      // 获取点赞的评论ID，并确保它是一个数组
      let upvotedIds = await getUpvotedCommentIds(id);
      if (!Array.isArray(upvotedIds)) {
        console.log("upvotedIds:", upvotedIds);
        upvotedIds = [];
      }
      upvotedIds = upvotedIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      this.setData({ upvotedCommentIds: upvotedIds });
      spot.comments = await getComments(id, 1, this.data.pageSize); // 加载第一页评论
      // 格式化评论时间
      spot.comments.forEach(comment => {
        comment.id = parseInt(comment.id, 10);
        comment.formattedTime = formatTime(comment.time);
        comment.replies.forEach(reply => {
          reply.formattedTime = formatTime(reply.time);
        });
        comment.isUpvoted = this.isUpvoted(comment.id);
      });
      this.setData({
        spot: spot,
        currentPage: 1,
        hasMore: true
      }, () => {
        wx.setNavigationBarTitle({
          title: this.data.spot.name || "详情"
        });
        const favoriteSpotIds = app.globalData.favoriteSpotIds || [];
        const isCollected = favoriteSpotIds.includes(spot.id);
        this.setData({
          collected: isCollected
        });
        // 初始排序
        this.sortComments();
      });
    }
    console.log(this.data.spot);
  },

  // 加载更多评论
  loadMoreComments: async function () {
    const { spot, currentPage, pageSize, currentSort } = this.data;
    const newComments = await getComments(spot.id, currentPage + 1, pageSize);
    if (newComments.length > 0) {
      // 格式化新评论时间并确保 ID 为整数
      newComments.forEach(comment => {
        comment.id = parseInt(comment.id, 10); // 转换 ID 为整数
        comment.formattedTime = formatTime(comment.time);
      });
      spot.comments = spot.comments.concat(newComments);
      this.setData({
        spot: spot,
        currentPage: currentPage + 1
      }, () => {
        this.sortComments();
      });
    } else {
      this.setData({ hasMore: false });
    }
  },


  // 排序评论
  sortComments: function () {
    const { spot, currentSort } = this.data;
    let sortedComments = [...spot.comments];
    if (currentSort === "按热度") {
      // 按点赞数降序
      sortedComments.sort((a, b) => b.upvotes - a.upvotes);
    } else if (currentSort === "按时间") {
      // 按时间降序
      sortedComments.sort((a, b) => b.time - a.time);
    }
    this.setData({
      ['spot.comments']: sortedComments
    });
  },

  // 排序选择器改变
  toggleSort: function () {
    this.setData({
      currentSort: this.data.currentSort === "按热度" ? "按时间" : "按热度"
    }, () => {
      this.sortComments();
    });
  },

  // 轮播图切换
  onSwiperChange: function (e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  // 收藏/取消收藏
  toggleCollect: function () {
    const spotId = this.data.spot.id;
    let favoriteSpotIds = app.globalData.favoriteSpotIds || [];

    if (favoriteSpotIds.includes(spotId)) {
      favoriteSpotIds = favoriteSpotIds.filter(id => id !== spotId);
      this.setData({ collected: false });
    } else {
      favoriteSpotIds.push(spotId);
      this.setData({ collected: true });
    }

    app.updateFavoriteSpotIds(favoriteSpotIds);
    wx.showToast({
      title: this.data.collected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  // 导航到景点
  onNavigate: function () {
    const { latitude, longitude } = this.data.spot;
    wx.openLocation({
      latitude: latitude || 39.9042, // 默认北京
      longitude: longitude || 116.4074,
      scale: 15,
      name: this.data.spot.name,
      address: this.data.spot.address
    });
  },

  // 添加评论输入
  onCommentInput: function (e) {
    this.setData({
      newComment: {
        ...this.data.newComment,
        content: e.detail.value
      }
    });
  },

  // 设置评论评分
  onRateChange: function (e) {
    const rating = e.detail.value;
    this.setData({
      newComment: {
        ...this.data.newComment,
        rating: rating
      }
    });
  },

  // 提交评论
  submitComment: function () {
    const { spot, newComment } = this.data;
    if (newComment.content.trim() === "") {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }
    const currentTimestamp = Date.now();
    const comment = {
      id: currentTimestamp, // 保持为整数
      author: "游客", // 可以替换为实际用户信息
      avatar: "/resources/default-avatar.png", // 默认头像，可根据实际情况替换
      content: newComment.content,
      rating: newComment.rating,
      upvotes: 0,
      time: currentTimestamp,
      formattedTime: formatTime(currentTimestamp),
      replies: []
    };
    spot.comments.push(comment); // 新评论显示在最前面
    this.setData({
      spot: spot,
      newComment: { content: "", rating: 5 }
    }, () => {
      this.sortComments();
    });
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    });
    // 可选：滚动到评论底部
    wx.nextTick(() => {
      wx.pageScrollTo({
        scrollTop: 999999, // 滚动到底部
        duration: 300
      });
    });
  },


  // 回复按钮点击
  onReply: function (e) {
    const commentId = e.currentTarget.dataset.id;
    this.setData({
      replyingTo: commentId,
      newReply: ""
    });
  },

  // 回复输入
  onReplyInput: function (e) {
    this.setData({
      newReply: e.detail.value
    });
  },

  // 提交回复
  submitReply: function () {
    const { spot, replyingTo, newReply } = this.data;
    if (newReply.trim() === "") {
      wx.showToast({
        title: '回复内容不能为空',
        icon: 'none'
      });
      return;
    }
    const commentIndex = spot.comments.findIndex(c => c.id === replyingTo);
    if (commentIndex !== -1) {
      const comment = spot.comments[commentIndex];
      const reply = {
        author: "游客", // 可以替换为实际用户信息
        avatar: "/resources/default-avatar.png",
        content: newReply,
        time: Date.now(),
        formattedTime: formatTime(Date.now())
      };
      // 在原有回复数组前添加新回复
      comment.replies.unshift(reply);
      // 更新 spot 数据
      this.setData({
        [`spot.comments[${commentIndex}].replies`]: comment.replies,
        replyingTo: null,
        newReply: ""
      }, () => {
        this.sortComments();
      });
      wx.showToast({
        title: '回复成功',
        icon: 'success'
      });
    }
  },

  // 判断是否点赞
  isUpvoted: function (id) {
    console.log("判断是否点赞")
    console.log("id:", id);
    console.log("upvotedCommentIds:", this.data.upvotedCommentIds);
    console.log("判断1：", this.data.upvotedCommentIds.includes(id));
    console.log("判断2：", id in this.data.upvotedCommentIds);
    return this.data.upvotedCommentIds.includes(id) || id in this.data.upvotedCommentIds;
  },

  // 点赞功能
  onUpvote: function (e) {
    console.log(e.currentTarget);
    let commentId = parseInt(e.currentTarget.dataset.id, 10); // 转换为整数
    const { spot, upvotedCommentIds } = this.data;

    const commentIndex = spot.comments.findIndex(c => {
      return c.id === commentId; // 比较整数类型的 ID
    });

    console.log("commentIndex:", commentIndex);

    if (commentIndex !== -1) {
      const comment = spot.comments[commentIndex];
      if (upvotedCommentIds.includes(commentId)) {
        // 取消点赞
        const updatedUpvotedIds = upvotedCommentIds.filter(id => id !== commentId);
        this.setData({
          [`spot.comments[${commentIndex}].upvotes`]: Math.max(comment.upvotes - 1, 0),
          [`spot.comments[${commentIndex}].isUpvoted`]: false,
          upvotedCommentIds: updatedUpvotedIds
        });
      } else {
        const updatedUpvotedIds = upvotedCommentIds.concat(commentId);
        this.setData({
          [`spot.comments[${commentIndex}].upvotes`]: comment.upvotes + 1,
          [`spot.comments[${commentIndex}].isUpvoted`]: true,
          upvotedCommentIds: updatedUpvotedIds
        });
      }
      console.log("upvotedCommentIds:", this.data.upvotedCommentIds);
    }
  },



  // 分享功能
  onShare: function () {
    wx.showShareMenu({
      withShareTicket: true
    });
  }
});
