import { baseUrl } from './baseUrl';
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
                console.log("getFavoriteSpotIds res: ", res);
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
                console.log("updateFavoriteSpotIds res: ", res);
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function getSpots(province = '', city = '', type = '') {
    // 构建查询参数字符串
    let queryParams = [];
    if (province) queryParams.push(`province=${province}`);
    if (city) queryParams.push(`city=${city}`);
    if (type) queryParams.push(`type=${type}`);
    const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';

    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/spots${queryString}`,  // 根据是否有参数构建 URL
            method: 'GET',
            success: (res) => {
                resolve(res.data);
                console.log("getSpots res: ", res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}