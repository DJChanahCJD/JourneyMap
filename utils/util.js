// utils/util.js



/**
 * 格式化数字，小于 10 的数字前面补 0
 * @param {number} n - 需要格式化的数字
 * @returns {string} 格式化后的两位数的字符串
 */
function formatNumber(n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
};

/**
 * 显示成功消息的弹窗
 * @param {string} title - 显示的消息内容
 * @param {number} [duration=1500] - 持续时间，默认 1500 毫秒
 */
const showSuccessMessage = (title, duration = 1500) => {
    wx.showToast({
        title: title,
        icon: 'success',
        duration: duration,
    });
};

/**
 * 显示错误消息的弹窗
 * @param {string} title - 显示的消息内容
 * @param {number} [duration=1500] - 持续时间，默认 1500 毫秒
 */
const showErrorMessage = (title, duration = 1500) => {
    wx.showToast({
        title: title,
        icon: 'none',
        duration: duration,
    });
};

// 导出实用函数供其他模块使用
module.exports = {
    formatTime,
    showSuccessMessage,
    showErrorMessage,
    formatNumber,  // formatNumber 也可以单独导出，供需要时调用
};
