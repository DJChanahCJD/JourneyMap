// utils/util.js

/**
 * 格式化时间，将时间戳转换为 "YYYY-MM-DD HH:mm" 格式
 * @param {number} time - 时间戳
 * @returns {string} 格式化后的日期字符串，格式为 "YYYY-MM-DD HH:mm"
 */
function formatTime(time) {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    console.log(`${year}-${month}-${day} ${hour}:${minute}`);
    return `${year}-${month}-${day} ${hour}:${minute}`;
};

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

/**
 * 保存日志到本地存储
 * @param {string} log - 日志内容
 */
const saveLog = (log) => {
    let logs = wx.getStorageSync('logs') || [];
    logs.unshift(log);
    wx.setStorageSync('logs', logs);
};

/**
 * 获取本地存储的所有日志
 * @returns {Array} 返回保存的日志列表
 */
const getLogs = () => {
    return wx.getStorageSync('logs') || [];
};

// 导出实用函数供其他模块使用
module.exports = {
    formatTime,
    showSuccessMessage,
    showErrorMessage,
    saveLog,
    getLogs,
    formatNumber,  // formatNumber 也可以单独导出，供需要时调用
};
