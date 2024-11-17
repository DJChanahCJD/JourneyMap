import { baseUrl } from './baseUrl';
export function getTags() {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/scenic/taglist`,
            method: 'GET',
            success: (res) => {
                console.log("getTags res.data: ", res.data);
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function getCategories() {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/scenic/categories`,
            method: 'GET',
            success: (res) => {
                console.log("getCategories res.data.data: ", res.data.data);
                resolve(res.data.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function getSpotDetail(id) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/scenic/getscenicById?id=${id}`,
            method: 'GET',
            success: (res) => {
                console.log("getSpotDetail res.data: ", res.data);
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
            url: `${baseUrl}/user/getuserfavors`,
            method: 'POST',
            data: { uuid: userId },
            success: (res) => {
                console.log("getFavoriteSpotIds res: ", res);
                const ids = res.data.data.id || [];
                // 将所有id转为整数
                const intIds = ids.map(id => parseInt(id, 10));
                resolve(intIds);
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
            url: `${baseUrl}/user/updatefavor`,
            method: 'POST',
            data: { uuid: userId, id: spotIds },
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

    console.log("getscenic queryString: ", queryString);
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/scenic/getscenices${queryString}`,  // 根据是否有参数构建 URL
            method: 'GET',
            success: (res) => {
                console.log(res);
                let data = res.data.data;
                data.forEach(spot => {
                    spot.id = parseInt(spot.id, 10);
                });
                resolve(data);
                console.log("getscenic res: ", data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function recommendSpot(recommendSpotData) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/audit/postAuditItem`,
            method: 'POST',
            data: recommendSpotData,
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}
