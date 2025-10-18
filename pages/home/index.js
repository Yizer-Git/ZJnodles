"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../services/api");
function ensureLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield wx.login();
            if (res.code) {
                const auth = yield (0, api_1.loginByCode)({ code: res.code });
                if (auth && typeof auth === 'object' && 'token' in auth && auth.token) {
                    wx.setStorageSync('token', auth.token);
                }
            }
        }
        catch (error) {
            console.log('login ignored', error);
        }
    });
}
function convertProductToRecommendation(product) {
    var _a;
    const price = (product.skus || [])
        .map((sku) => (typeof (sku === null || sku === void 0 ? void 0 : sku.price) === 'number' ? sku.price : undefined))
        .filter((value) => typeof value === 'number');
    const minPrice = price.length ? Math.min(...price) : null;
    const desc = product.subtitle || product.descHtml || '';
    return {
        id: product.id || '',
        title: product.title,
        cover: (_a = product.images) === null || _a === void 0 ? void 0 : _a[0],
        description: desc,
        priceText: typeof minPrice === 'number' ? `¥${(minPrice / 100).toFixed(2)}` : undefined
    };
}
function transformContent(item) {
    const anyItem = item;
    return {
        id: anyItem.id || '',
        title: anyItem.title,
        cover: anyItem.cover || anyItem.poster,
        description: anyItem.summary || anyItem.desc || anyItem.descHtml || '',
        categoryLabel: anyItem.categoryLabel || anyItem.category || '精选'
    };
}
const initialData = {
    loading: true,
    contents: [],
    recommendations: [],
    operations: [],
    campaign: null,
    showCampaign: false
};
Page({
    data: Object.assign({}, initialData),
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            yield ensureLogin();
            yield this.bootstrap();
        });
    },
    onPullDownRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bootstrap();
            wx.stopPullDownRefresh();
        });
    },
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.setData({ loading: true });
            try {
                const [contentRes, productRes, dashboard] = yield Promise.all([
                    (0, api_1.listContents)({ page: 1, size: 5 }),
                    (0, api_1.listProducts)({ page: 1, size: 6 }),
                    (0, api_1.getOpsDashboard)()
                ]);
                const contents = (contentRes.items || []).map(transformContent);
                const recommendations = (productRes.items || []).map(convertProductToRecommendation);
                const campaign = contents.length ? contents[0] : null;
                const operations = (((_a = dashboard === null || dashboard === void 0 ? void 0 : dashboard.operations) === null || _a === void 0 ? void 0 : _a.slots) || []).map((slot) => ({
                    id: slot.id,
                    name: slot.name,
                    description: slot.description,
                    online: slot.online
                }));
                this.setData({
                    contents,
                    recommendations,
                    operations,
                    campaign,
                    showCampaign: !!campaign
                });
            }
            catch (error) {
                wx.showToast({ title: '首页内容加载失败', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    closeCampaign() {
        this.setData({ showCampaign: false });
    },
    goProducts() {
        wx.switchTab({ url: '/pages/products/index' });
    },
    goTrace() {
        wx.navigateTo({ url: '/pages/trace/index' });
    },
    goStudy() {
        wx.navigateTo({ url: '/pages/study/index' });
    },
    goCommunity() {
        wx.switchTab({ url: '/pages/community/index' });
    },
    goEnterprise() {
        wx.navigateTo({ url: '/pages/enterprise/index' });
    }
});
