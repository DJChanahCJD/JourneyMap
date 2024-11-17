import { baseUrl } from './baseUrl';
export function getComments(spotId, page = 1, pageSize = 10) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/comment/getCommentsByScenicId?scenicId=${spotId}`,
            method: 'GET',
            success: (res) => {
                console.log("getComments res.data: ", res.data.data);
                resolve(res.data.data || []);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function addComment(spotId, comment) {
    console.log("addComment comment: ", comment);
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/comment/addComment`,
            method: 'POST',
            data: {
                rating: comment.rating,
                content: comment.content,
                uuid: comment.userId,
                scenic_ID: spotId
            },
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

export function addReply(spotId, replyingTo, reply) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}/comment/addReply`,
            method: 'POST',
            data: {
                commentID: replyingTo,
                uuid: reply.userId,
                content: reply.content
            },
            success: (res) => {
                console.log("addReply res: ", res);
                resolve(res.data.data);
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
            url: `${baseUrl}/user/upvotedCommentIds?userId=${userId}`,
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
            url: `${baseUrl}/user/upvotedCommentIds?userId=${userId}`,
            method: 'POST',
            data: { data: commentIds },
            success: (res) => {
                resolve(res.data);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}