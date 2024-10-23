// api.js
const baseUrl = "https://api.example.com";
export function getSpotDetail(id) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/spots/${id}`,
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

export function getFavoriteSpotIds(userId) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/${userId}/favorites`,
            method: 'GET',
            success: (res) => {
                resolve(res.data || []);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function updateFavoriteSpotIds(userId, spotIds) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/${userId}/favorites`,
            method: 'POST',
            data: { spotIds: spotIds },
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function getSpotList(province, city, type) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/spots?province=${province}&city=${city}&type=${type}`,
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

export function login(code) {
    return new Promise((resolve, reject) => {
        console.log("login!!!")
        wx.request({
            url: `${baseUrl}/login`,
            method: 'POST',
            data: { code: code },
            dataType: 'json',
            success: (res) => {
                resolve(res.data);
                console.log("res: ", res);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}
