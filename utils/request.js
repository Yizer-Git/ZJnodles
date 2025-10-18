"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = getToken;
exports.setToken = setToken;
exports.request = request;
function resolveBaseUrl() {
    const stored = wx.getStorageSync('apiBaseUrl');
    if (stored)
        return stored;
    try {
        const app = getApp();
        if (app && app.config && app.config.apiBaseUrl)
            return app.config.apiBaseUrl;
        if (app && app.globalData && app.globalData.apiBaseUrl)
            return app.globalData.apiBaseUrl;
    }
    catch (_a) {
    }
    return '';
}
function buildUrl(path) {
    if (/^https?:\/\//.test(path))
        return path;
    const base = resolveBaseUrl();
    if (!base)
        return null;
    if (path.startsWith('/'))
        return `${base}${path}`;
    return `${base}/${path}`;
}
function getToken() {
    return wx.getStorageSync('token') || null;
}
function setToken(token) {
    wx.setStorageSync('token', token);
}
function request(opts) {
    return new Promise((resolve, reject) => {
        const targetUrl = buildUrl(opts.url);
        if (!targetUrl) {
            console.warn('[request] missing apiBaseUrl, aborting request:', opts.url);
            reject({ code: 'NO_BASE_URL', message: 'API base url is not configured' });
            return;
        }
        wx.request({
            url: targetUrl,
            method: (opts.method || 'GET'),
            data: opts.data,
            header: Object.assign({ 'Content-Type': 'application/json' }, (opts.auth && getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})),
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300)
                    resolve(res.data);
                else
                    reject({ code: res.statusCode, data: res.data });
            },
            fail: reject
        });
    });
}
