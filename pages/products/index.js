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
const DEFAULT_COVER = '/assets/images/product-images/19d9deb046197ca7aa255cba919c8a32.jpg';
const FILTER_TABS = [
    { label: '热销推荐', value: 'hot' },
    { label: '新品上市', value: 'new' },
    { label: '组合套餐', value: 'bundle' },
    { label: '礼盒周边', value: 'gift' }
];
const PRODUCT_BANNER_IMAGES = [
    '/assets/images/serving-suggestions/6_0.jpg',
    '/assets/images/serving-suggestions/6_2.jpg',
    '/assets/images/serving-suggestions/6_3.jpg',
    '/assets/images/serving-suggestions/6_4.jpg'
];
const LOCAL_PRODUCTS = [
    {
        id: 'local-heritage-gift',
        title: '非遗古法礼盒',
        subtitle: '匠人手作 · 实木礼盒收纳',
        images: ['/assets/images/product-images/19d9deb046197ca7aa255cba919c8a32.jpg'],
        tags: ['热销推荐', '实木礼盒', '伴手礼'],
        heritageNote: '礼盒甄选',
        craftNote: '原麦配方',
        skus: [
            {
                id: 'sku-local-heritage',
                price: 32800,
                attrs: { 规格: '6袋礼盒', 工艺: '日晒古法' }
            }
        ],
        filterTags: ['hot', 'gift']
    },
    {
        id: 'local-new-bundle',
        title: '椒麻挂面试吃装',
        subtitle: '花椒提鲜 · 轻巧分装',
        images: ['/assets/images/product-images/4025ed4b0491026c9e22d865d6435584.jpeg'],
        tags: ['新品上市', '椒香', '轻食'],
        heritageNote: '椒香手工',
        craftNote: '即煮即享',
        skus: [
            {
                id: 'sku-local-new',
                price: 28900,
                attrs: { 口味: '花椒清香', 规格: '4袋装' }
            },
            {
                id: 'sku-local-new-plus',
                price: 35800,
                attrs: { 口味: '椒麻劲爽', 规格: '6袋装' }
            }
        ],
        filterTags: ['new', 'bundle']
    },
    {
        id: 'local-bundle-family',
        title: '匠心家庭套餐',
        subtitle: '多口味搭配 · 家庭分享',
        images: ['/assets/images/product-images/4d52714b661caf20c0ddfbf86dba5652.jpg'],
        tags: ['组合套餐', '限时礼遇', '家庭量贩'],
        heritageNote: '家庭尊享',
        craftNote: '多味慢晒',
        skus: [
            {
                id: 'sku-local-family',
                price: 45900,
                attrs: { 规格: '8袋礼盒', 配料: '原味+荞麦' }
            },
            {
                id: 'sku-local-family-plus',
                price: 52800,
                attrs: { 规格: '12袋礼盒', 配料: '原味+青椒' }
            }
        ],
        filterTags: ['bundle', 'gift', 'hot']
    }
];
function pickLocalProducts(filter) {
    if (!filter) {
        return LOCAL_PRODUCTS;
    }
    const matched = LOCAL_PRODUCTS.filter((item) => { var _a; return ((_a = item.filterTags) === null || _a === void 0 ? void 0 : _a.includes(filter)); });
    return matched.length ? matched : LOCAL_PRODUCTS;
}
function formatPrice(cents) {
    if (typeof cents !== 'number')
        return '--';
    return `¥${(cents / 100).toFixed(2)}`;
}
function buildProductCard(product) {
    const cover = product.images && product.images.length > 0 ? product.images[0] : DEFAULT_COVER;
    const local = product;
    const prices = (product.skus || [])
        .map((sku) => (typeof (sku === null || sku === void 0 ? void 0 : sku.price) === 'number' ? sku.price : undefined))
        .filter((price) => typeof price === 'number');
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const baseSubtitle = product.subtitle || '匠人手工晾晒 · 入口回甘';
    const subtitle = baseSubtitle.includes('非遗') ? baseSubtitle : `${baseSubtitle} · 非遗古法`;
    const rawTags = [
        '非遗古法',
        '自然晾晒',
        ...(Array.isArray(product.tags) ? product.tags : []),
        minPrice < 2999 ? '限时礼遇' : undefined
    ].filter((tag) => !!tag);
    const tags = Array.from(new Set(rawTags)).slice(0, 5);
    const heritageNote = local.heritageNote || '匠人手作';
    const craftNote = local.craftNote || '竹架晾晒';
    return {
        id: product.id || '',
        title: product.title,
        subtitle,
        cover,
        minPrice,
        priceLabel: formatPrice(minPrice),
        tags,
        heritageNote,
        craftNote
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
    { label: '仓配', value: '四川中江发货' },
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
    logistics: DEFAULT_LOGISTICS,
    bannerImages: PRODUCT_BANNER_IMAGES
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
                let products = ((data === null || data === void 0 ? void 0 : data.items) || []);
                if (!products.length) {
                    const filterValue = params.category;
                    products = pickLocalProducts(filterValue);
                }
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
                const fallback = pickLocalProducts(params.category);
                const first = fallback[0];
                this.setData({
                    rawProducts: fallback,
                    items: fallback.map(buildProductCard),
                    bundles: first ? buildBundles(first) : [],
                    discountTips: first ? buildDiscountTips(first) : []
                });
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

