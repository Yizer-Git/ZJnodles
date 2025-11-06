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
const backgrounds_1 = require("../../utils/backgrounds");
const DEFAULT_STORY_TABS = ['全部', '传承人', '古法瞬间', '乡土风物'];
const DEFAULT_AUTHOR_AVATAR = '/assets/avatar-placeholder.jpg';
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
    const desc = product.subtitle || product.desc || product.descHtml || '';
    const baseDesc = desc
        ? String(desc).replace(/<[^>]+>/g, '')
        : '匠人手作，中江挂面以日晒留住麦香。';
    const craftKeywords = '非遗古法 · 自然晾晒';
    const description = baseDesc.includes('非遗') ? baseDesc : `${baseDesc} · ${craftKeywords}`;
    return {
        id: product.id || '',
        title: product.title,
        cover: (_a = product.images) === null || _a === void 0 ? void 0 : _a[0],
        description,
        priceText: typeof minPrice === 'number' ? `¥${(minPrice / 100).toFixed(2)}` : undefined,
        heritageLabel: '非遗古法',
        craftNote: '自然晾晒'
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
function transformContentToStory(item) {
    const anyItem = item;
    const tagsArray = Array.isArray(anyItem.tags)
        ? anyItem.tags.filter((tag) => typeof tag === 'string')
        : [];
    const rawCategory = anyItem.storyCategory || anyItem.categoryLabel || anyItem.category || tagsArray[0] || '';
    const normalized = String(rawCategory).replace(/\s+/g, '').toLowerCase();
    let categoryLabel = String(rawCategory || '').trim();
    if (!categoryLabel) {
        if (normalized.includes('craft') || normalized.includes('工') || normalized.includes('晒')) {
            categoryLabel = '古法瞬间';
        }
        else if (normalized.includes('乡') || normalized.includes('村') || normalized.includes('旅')) {
            categoryLabel = '乡土风物';
        }
        else {
            categoryLabel = '传承人';
        }
    }
    else if (normalized.includes('匠') || normalized.includes('传承') || normalized.includes('人')) {
        categoryLabel = '传承人';
    }
    else if (normalized.includes('晒') || normalized.includes('工') || normalized.includes('艺')) {
        categoryLabel = '古法瞬间';
    }
    else if (normalized.includes('乡') || normalized.includes('村') || normalized.includes('风物')) {
        categoryLabel = '乡土风物';
    }
    const description = anyItem.summary || anyItem.desc || anyItem.descHtml || anyItem.excerpt || anyItem.intro || '';
    const cleanDescription = String(description)
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return {
        id: anyItem.id || '',
        title: anyItem.title || anyItem.name || '非遗故事',
        cover: anyItem.cover || anyItem.poster || anyItem.image || anyItem.banner,
        description: cleanDescription,
        categoryLabel,
        authorName: anyItem.authorName || anyItem.author || '匠人顾问',
        authorAvatar: anyItem.authorAvatar || anyItem.avatar || DEFAULT_AUTHOR_AVATAR,
        views: typeof anyItem.views === 'number' ? anyItem.views : anyItem.reads || 0,
        likes: typeof anyItem.likes === 'number' ? anyItem.likes : anyItem.favorites || 0,
        comments: typeof anyItem.comments === 'number' ? anyItem.comments : anyItem.replies || 0,
        tags: tagsArray
    };
}
function filterStories(stories, tab) {
    if (!tab || tab === DEFAULT_STORY_TABS[0]) {
        return stories;
    }
    const normalizedTab = tab.replace(/\s+/g, '').toLowerCase();
    return stories.filter((story) => {
        const tagSource = [
            story.categoryLabel,
            ...(Array.isArray(story.tags) ? story.tags : [])
        ]
            .filter(Boolean)
            .join(',')
            .replace(/\s+/g, '')
            .toLowerCase();
        if (!tagSource) {
            return true;
        }
        return tagSource.includes(normalizedTab);
    });
}
const initialData = {
    loading: true,
    contents: [],
    recommendations: [],
    operations: [],
    campaign: null,
    showCampaign: false,
    heritageHighlights: [],
    stories: [],
    storyTabs: [...DEFAULT_STORY_TABS],
    activeStoryTab: DEFAULT_STORY_TABS[0],
    displayStories: [],
    backgrounds: backgrounds_1.backgroundAssets
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
                const rawContents = (contentRes.items || []);
                const contents = rawContents.map(transformContent);
                const stories = rawContents.map(transformContentToStory);
                const recommendations = (productRes.items || []).map(convertProductToRecommendation);
                const heritageHighlights = contents.slice(0, 3);
                const highlights = heritageHighlights.length ? heritageHighlights : contents;
                const campaign = highlights.length ? highlights[0] : null;
                const operations = (((_a = dashboard === null || dashboard === void 0 ? void 0 : dashboard.operations) === null || _a === void 0 ? void 0 : _a.slots) || []).map((slot) => ({
                    id: slot.id,
                    name: slot.name,
                    description: slot.description,
                    online: slot.online
                }));
                const derivedTabs = Array.from(new Set(stories
                    .map((story) => story.categoryLabel)
                    .filter((value) => !!value)));
                const storyTabs = Array.from(new Set([...DEFAULT_STORY_TABS, ...derivedTabs]));
                const activeStoryTab = storyTabs.includes(this.data.activeStoryTab) && this.data.activeStoryTab
                    ? this.data.activeStoryTab
                    : storyTabs[0];
                const displayStories = filterStories(stories, activeStoryTab);
                this.setData({
                    contents,
                    recommendations,
                    operations,
                    campaign,
                    showCampaign: !!campaign,
                    heritageHighlights: highlights,
                    stories,
                    storyTabs,
                    activeStoryTab,
                    displayStories
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
    goHeritageStory() {
        wx.switchTab({ url: '/pages/hall/index' });
    },
    goCraftProcess() {
        wx.navigateTo({ url: '/pages/trace/index' });
    },
    goMasterArchive() {
        wx.navigateTo({ url: '/pages/study/index' });
    },
    goTrace() {
        wx.navigateTo({ url: '/pages/trace/index' });
    },
    goStudy() {
        wx.navigateTo({ url: '/pages/study/index' });
    },
    goBooking() {
        wx.navigateTo({ url: '/pages/booking/index' });
    },
    goCommunity() {
        wx.navigateTo({ url: '/pages/community/index' });
    },
    goOrders() {
        wx.navigateTo({ url: '/pages/orders/index' });
    },
    goOps() {
        wx.navigateTo({ url: '/pages/ops/index' });
    },
    goEnterprise() {
        wx.navigateTo({ url: '/pages/enterprise/index' });
    },
    goSearch() {
        wx.switchTab({ url: '/pages/products/index' });
    },
    handleStoryTabChange(event) {
        const { tab } = event.currentTarget.dataset;
        if (!tab || tab === this.data.activeStoryTab) {
            return;
        }
        const displayStories = filterStories(this.data.stories, tab);
        this.setData({ activeStoryTab: tab, displayStories });
    }
});
