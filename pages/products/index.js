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
const DEFAULT_PAGE_OPTIONS = { page: 1, size: 10 };
const DEFAULT_COVER = 'https://dummyimage.com/600x400/eee/aaa&text=ZHGM';
const FILTER_TABS = [
    { label: '热销推荐', value: 'hot' },
    { label: '新品上市', value: 'new' },
    { label: '组合套餐', value: 'bundle' },
    { label: '礼盒周边', value: 'gift' }
];
function formatPrice(cents) {
    if (typeof cents !== 'number')
        return '--';
    return `¥${(cents / 100).toFixed(2)}`;
}
function buildProductCard(product) {
    var _a, _b;
    const cover = product.images && product.images.length > 0 ? product.images[0] : DEFAULT_COVER;
    const prices = (product.skus || [])
        .map((sku) => (typeof (sku === null || sku === void 0 ? void 0 : sku.price) === 'number' ? sku.price : undefined))
        .filter((price) => typeof price === 'number');
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const tags = [
        (_a = product.tags) === null || _a === void 0 ? void 0 : _a[0],
        (_b = product.tags) === null || _b === void 0 ? void 0 : _b[1],
        minPrice < 2999 ? '限时优惠' : undefined
    ].filter(Boolean);
    return {
        id: product.id || '',
        title: product.title,
        subtitle: product.subtitle,
        cover,
        minPrice,
        priceLabel: formatPrice(minPrice),
        tags
    };
}
function buildBundles(product) {
    const base = product.title || '组合套餐';
    const skus = product.skus || [];
    if (!skus.length)
        return [];
    const first = skus[0];
    const second = skus[1] || first;
    const price = typeof (first === null || first === void 0 ? void 0 : first.price) === 'number' ? first.price : 0;
    const extra = typeof (second === null || second === void 0 ? void 0 : second.price) === 'number' ? second.price : price;
    const firstName = first && first.attrs ? Object.values(first.attrs).join('/') : '多份装';
    const secondName = second && second.attrs ? Object.values(second.attrs).join('/') : '体验装';
    const bundlePrice = Math.round((price + extra) * 0.9);
    return [{
            id: `${product.id}-bundle`,
            title: `${base}双人礼遇`,
            items: `${firstName} + ${secondName}`,
            priceLabel: formatPrice(bundlePrice),
            originalPriceLabel: formatPrice(price + extra),
            savingLabel: `立省${formatPrice(price + extra - bundlePrice)}`
        }];
}
function buildDiscountTips(product) {
    const hasGroup = (product.skus || []).some((sku) => {
        const info = sku;
        return (info === null || info === void 0 ? void 0 : info.minQuantity) && info.minQuantity > 1;
    });
    return [
        { label: '满减', description: '满199减30 | 满299减60' },
        ...(hasGroup ? [{ label: '团购', description: '2件95折，5件9折' }] : []),
        { label: '叠加券', description: '新人券+节日券可叠加使用' }
    ];
}
const DEFAULT_LOGISTICS = [
    { label: '仓配', value: '四川/江苏双仓发货' },
    { label: '时效', value: '默认48小时内发货，节假日除外' },
    { label: '售后', value: '7天无忧退换，客服9:00-22:00在线' }
];
const initialData = {
    loading: false,
    items: [],
    rawProducts: [],
    filters: FILTER_TABS,
    activeFilter: FILTER_TABS[0].value,
    bundles: [],
    discountTips: [],
    logistics: DEFAULT_LOGISTICS
};
Page({
    data: Object.assign({}, initialData),
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadProducts();
        });
    },
    loadProducts() {
        return __awaiter(this, arguments, void 0, function* (params = DEFAULT_PAGE_OPTIONS) {
            this.setData({ loading: true });
            try {
                const data = yield (0, api_1.listProducts)(params);
                const products = (data === null || data === void 0 ? void 0 : data.items) || [];
                const cards = products.map(buildProductCard);
                const first = products[0];
                this.setData({
                    rawProducts: products,
                    items: cards,
                    bundles: first ? buildBundles(first) : [],
                    discountTips: first ? buildDiscountTips(first) : []
                });
            }
            catch (error) {
                wx.showToast({ title: '商品加载失败', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    handleFilterChange(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { value } = event.currentTarget.dataset;
            if (!value)
                return;
            this.setData({ activeFilter: value });
            yield this.loadProducts(Object.assign(Object.assign({}, DEFAULT_PAGE_OPTIONS), { category: value }));
        });
    },
    previewBundle(event) {
        const { id } = event.currentTarget.dataset;
        const bundle = this.data.bundles.find((item) => item.id === id);
        if (!bundle)
            return;
        wx.showModal({
            title: bundle.title,
            content: `${bundle.items}\n${bundle.priceLabel}（${bundle.savingLabel || '已优惠'}）`,
            showCancel: false
        });
    },
    showDiscountTips() {
        wx.showActionSheet({
            itemList: this.data.discountTips.map((tip) => `${tip.label}：${tip.description}`)
        });
    },
    addToCart(e) {
        const { id } = e.currentTarget.dataset;
        const product = this.data.rawProducts.find((item) => item.id === id);
        wx.showToast({
            title: (product === null || product === void 0 ? void 0 : product.title) ? `已加入：${product.title}` : '已加入购物车',
            icon: 'success'
        });
    },
    goToCheckout() {
        wx.navigateTo({ url: '/pages/orders/index' });
    }
});
