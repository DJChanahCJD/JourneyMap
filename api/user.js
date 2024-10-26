// user.js
import { baseUrl } from './baseUrl';

export function login(code) {
    return new Promise((resolve, reject) => {
        console.log("login!!!")
        wx.request({
            url: `${baseUrl}/login`,
            method: 'POST',
            data: { code: code },
            dataType: 'json',
            success: (res) => {
                console.log("login res: ", res);
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

// 新增：获取用户信息的 API
export function getUserInfo(userId) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/${userId}/info`,
            method: 'GET',
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

// 新增：更新用户信息（头像和昵称）的 API
export function updateUserInfo(userId, data) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/${userId}/info`,
            method: 'PUT',
            data: data,
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function uploadAvatar(avatar) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/file/upload`,
            method: 'POST',
            data: { avatar: avatar },
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}
