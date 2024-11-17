// user.js
import { baseUrl } from './baseUrl';
export function login(code) {
    return new Promise((resolve, reject) => {
        console.log("login!!!")
        wx.request({
            url: `${baseUrl}/user/wxlogin`,
            method: 'POST',
            data: { code: code },
            dataType: 'json',
            success: (res) => {
                console.log("login res.data: ", res.data);
                resolve(res.data);
            },
            fail: (err) => {
                console.log("login err: ", err);
                reject(err);
            }
        });
    });
}

// 新增：获取用户信息的 API
export function getUserInfo(userId) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/getuser?uuid=${userId}`,
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
export function updateUserInfo(userInfo) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/updateuser`,
            method: 'POST',
            data: {uuid: userInfo.userId.toString(), name: userInfo.nickName},
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function uploadAvatar(filePath, userId) {
    return new Promise((resolve, reject) => {
        if (!filePath) {
            reject('File path is missing.');
            return;
        }
        if (!userId) {
            reject('User ID is missing.');
            return;
        }

        wx.uploadFile({
            url: `${baseUrl}/user/updateavatar`, // 后端上传接口
            filePath: filePath, // 选择的图片的临时路径
            name: 'file', // 对应后端接收文件的字段名
            formData: {
                uuid: userId, // 额外的参数，比如用户ID
            },
            success: (res) => {
                try {
                    const data = JSON.parse(res.data); // 上传成功后，解析返回的JSON数据
                    console.log("uploadAvatar response: ", data);
                    resolve(data.data);
                } catch (e) {
                    reject('上传成功，但解析响应失败');
                }
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}
