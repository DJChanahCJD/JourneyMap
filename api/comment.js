import { baseUrl } from './baseUrl';
export function getComments(spotId, page = 1, pageSize = 10) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/spots/${spotId}/comments?page=${page}&pageSize=${pageSize}`,
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

export function getUpvotedCommentIds(userId) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/${userId}/upvotedCommentIds`,
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

export function updateUpvotedCommentIds(userId, commentIds) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/user/${userId}/upvotedCommentIds`,
            method: 'POST',
            data: { commentIds: commentIds },
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}