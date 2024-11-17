const { getSpotDetail, getFavoriteSpotIds, updateFavoriteSpotIds } = require('../../api/spot');
const { getComments, getUpvotedCommentIds, addComment, addReply } = require('../../api/comment');
const { getUserInfo } = require('../../api/user');
const app = getApp();

// 格式化时间，将ISO时间字符串转换为 "YYYY-MM-DD HH:mm" 格式
function formatTime(timeStr) {
  try {
      // 处理 ISO 格式的时间字符串
      const date = new Date(timeStr);

      // 检查是否为有效日期
      if (isNaN(date.getTime())) {
          console.error('Invalid date:', timeStr);
          return timeStr; // 如果解析失败，返回原始字符串
      }

      // 获取北京时间（UTC+8）
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const beijingTime = new Date(utc + (3600000 * 8));

      const year = beijingTime.getFullYear();
      const month = (beijingTime.getMonth() + 1).toString().padStart(2, '0');
      const day = beijingTime.getDate().toString().padStart(2, '0');
      const hour = beijingTime.getHours().toString().padStart(2, '0');
      const minute = beijingTime.getMinutes().toString().padStart(2, '0');

      return `${year}-${month}-${day} ${hour}:${minute}`;
  } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr; // 发生错误时返回原始字符串
  }
}

Page({
  data: {
    spot: {}, // 保存景点的详细信息
    collected: false, // 是否收藏
    currentImageIndex: 0, // 当前显示的图片索引
    autoplay: false,
    newComment: { content: "", rating: 5 },
    replyingTo: null,
    newReply: "",
    upvotedCommentIds: app.globalData.upvotedCommentIds || [],
    currentPage: 1, // 当前评论页码
    pageSize: 10, // 每页评论数
    hasMore: true, // 是否还有更多评论
    sortOptions: ["按热度", "按时间"], // 排序选项
    currentSort: "按热度", // 当前排序方式
    userInfo: app.globalData.userInfo || {},
  },

  onLoad: async function (options) {
    try {
      // 显示加载提示
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      const spotId = parseInt(options.id, 10); // 获取从导航中传来的景点ID
      this.setData({
        upvotedCommentIds: (await getUpvotedCommentIds(app.globalData.userInfo.userId)).data,
        userInfo: app.globalData.userInfo,
        ['spot.comments']: await getComments(spotId, 1, this.data.pageSize)
      });
     app.globalData.upvotedCommentIds = this.data.upvotedCommentIds;
      this.loadSpotDetail(spotId); // 根据ID加载景点详情
    } catch (error) {
      console.error('页面加载错误:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
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
    try {
      const res = await getSpotDetail(id);
      const spotData = res.data;
      console.log("loadSpotDetail spotData: ", spotData);

      if (spotData) {
        // 格式化景点数据
        const formattedSpot = {
          id: spotData.id,
          name: spotData.name,
          images: spotData.imagesURL || [
            "https://imgtg-12w.pages.dev/file/9f3cb0f156b41b2dc0060.png",
            "https://imgtg-12w.pages.dev/file/9f3cb0f156b41b2dc0060.png"
          ],
          address: spotData.location,
          hours: spotData.openTime,
          contact: spotData.contact,
          links: spotData.links ? spotData.links.map(link => `${link.second}: ${link.first}`).join('\n') : '',
          description: spotData.description,
          latitude: parseFloat(spotData.latitude),
          longitude: parseFloat(spotData.longitude),
          tags: spotData.taglist || [],
          category: spotData.category,
          comments: spotData.comments || []
        };

        // 获取点赞的评论ID
        let upvotedIds = this.data.upvotedCommentIds;
        if (!Array.isArray(upvotedIds)) {
          upvotedIds = [];
        }
        upvotedIds = upvotedIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        this.setData({ upvotedCommentIds: upvotedIds });

        // 加载评论
        const commentsRes = await getComments(id, 1, this.data.pageSize);
        console.log("commentsRes: ", commentsRes);

        // 格式化评论
        const formattedComments = commentsRes.map(comment => ({
          id: comment.commentID,  // 使用原始的 commentID
          avatar: comment.avatarUrl || '/resources/default-avatar.png',
          author: comment.name || '匿名用户',
          content: comment.content || '',
          rating: parseInt(comment.rating || '5', 10),
          formattedTime: formatTime(comment.commentTime),
          upvotes: comment.like || 0,
          commentID: comment.commentID,  // 保留原始 commentID
          replies: Array.isArray(comment.replies) ? comment.replies.map(reply => ({
            id: reply.replyID,
            avatar: reply.avatarUrl || '/resources/default-avatar.png',
            author: reply.name || '匿名用户',
            content: reply.content || '',
            formattedTime: formatTime(reply.replyTime)
          })) : [],
          isUpvoted: this.isUpvoted(comment.commentID)
        }));

        // 过滤掉空评论
        formattedSpot.comments = formattedComments.filter(comment => comment.content.trim() !== '');

        console.log("Formatted comments: ", formattedSpot.comments);

        this.setData({
          spot: formattedSpot,
          currentPage: 1,
          hasMore: true
        }, () => {
          wx.setNavigationBarTitle({
            title: formattedSpot.name || "详情"
          });

          // 检查收藏状态
          const favoriteSpotIds = app.globalData.favoriteSpotIds || [];
          const isCollected = favoriteSpotIds.includes(formattedSpot.id);
          this.setData({
            collected: isCollected
          });

          // 初始排序
          this.sortComments();
        });
      }
    } catch (error) {
      console.error('加载景点详情失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  // 加载更多评论
  loadMoreComments: async function () {
    const { spot, currentPage, pageSize, currentSort } = this.data;
    spot.comments = await getComments(spot.id, currentPage + 1, pageSize);
    if (spot.comments.length > 0) {
      // 格式化新评论时间并确保 ID 为整数
      spot.comments.forEach(comment => {
        comment.id = parseInt(comment.id, 10); // 转换 ID 为整数
        comment.formattedTime = formatTime(comment.commentTime);
      });
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
    this.setData({
      ['newComment.rating']: e.detail.value
    });
  },

  // 提交评论
  submitComment: async function () {
    this.data.newComment.content = this.selectComponent('.comment-input').data.value;
    const { spot, newComment } = this.data;
    if (newComment.content.trim() === "") {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }

    const commentData = {
      userId: app.globalData.userInfo.userId,
      content: newComment.content,
      rating: newComment.rating
    };

    try {
      const res = await addComment(spot.id, commentData);
      const comment = res.data;

      // 格式化新评论数据
      const formattedComment = {
        id: comment.commentID,
        author: comment.name,
        avatar: comment.avatarUrl,
        content: comment.content,
        rating: parseInt(comment.rating, 10),
        time: comment.commentTime,
        formattedTime: formatTime(new Date(comment.commentTime)), // 使用正确的时间格式化
        upvotes: comment.like || 0,
        replies: comment.replies || [],
        isUpvoted: false
      };

      // 将新评论添加到评论列表
      spot.comments.unshift(formattedComment); // 添加到列表开头
      console.log("comment:", comment);

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

      // 滚动到评论顶部
      wx.pageScrollTo({
        selector: '.comments-section',
        duration: 300
      });

    } catch (error) {
      console.error('提交评论失败:', error);
      wx.showToast({
        title: '评论失败，请重试',
        icon: 'none'
      });
    }
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
  submitReply: async function () {
    this.data.newReply = this.selectComponent('.reply-text-input').data.value;
    const { spot, replyingTo, newReply, userInfo } = this.data;
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
      const replyData = {
        userId: app.globalData.userInfo.userId,
        author: userInfo.nickName || "游客",
        content: newReply,
      };
      const reply = (await addReply(spot.id, replyingTo, replyData));
      reply.formattedTime = formatTime(reply.replyTime);
      reply.avatar = reply.avatarUrl || reply.avatar || '/resources/default-avatar.png';
      reply.author = reply.name || reply.author || "匿名用户";
      reply.content = reply.content || "";
      // 在原有回复数组后添加新回复
      comment.replies.push(reply);
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
  isUpvoted: function (commentId) {
    return this.data.upvotedCommentIds.includes(commentId);
  },

  // 点赞功能
  onUpvote: function (e) {
    const commentId = e.currentTarget.dataset.id;
    const { spot, upvotedCommentIds } = this.data;

    const commentIndex = spot.comments.findIndex(c => c.id === commentId);

    if (commentIndex !== -1) {
      const comment = spot.comments[commentIndex];
      let updatedUpvotedIds;

      if (upvotedCommentIds.includes(commentId)) {
        // 取消点赞
        updatedUpvotedIds = upvotedCommentIds.filter(id => id !== commentId);
        this.setData({
          [`spot.comments[${commentIndex}].upvotes`]: Math.max(comment.upvotes - 1, 0),
          [`spot.comments[${commentIndex}].isUpvoted`]: false,
          upvotedCommentIds: updatedUpvotedIds
        });
      } else {
        // 添加点赞
        updatedUpvotedIds = [...upvotedCommentIds, commentId];
        this.setData({
          [`spot.comments[${commentIndex}].upvotes`]: comment.upvotes + 1,
          [`spot.comments[${commentIndex}].isUpvoted`]: true,
          upvotedCommentIds: updatedUpvotedIds
        });
      }

      app.updateUpvotedCommentIds(updatedUpvotedIds);
    }
  },



  // 分享功能
  onShare: function () {
    wx.showShareMenu({
      withShareTicket: true
    });
  }
});
