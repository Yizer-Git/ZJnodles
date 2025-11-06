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
const PAGE_SIZE = 10;
const STATUS_LABELS = {
    pending: '待确认',
    unpaid: '待支付',
    paid: '已支付',
    canceled: '已取消',
    fulfilled: '已完成',
    refunded: '已退款'
};
const STATUS_META = {
    pending: { className: 'status-pending', tip: '正在为您确认库存和物流' },
    unpaid: { className: 'status-unpaid', tip: '请尽快完成支付以保留库存' },
    paid: { className: 'status-paid', tip: '付款成功，预计 24 小时内发货' },
    canceled: { className: 'status-canceled', tip: '订单已取消，如有疑问请联系客服' },
    fulfilled: { className: 'status-fulfilled', tip: '已签收，感谢品味中江好面' },
    refunded: { className: 'status-refunded', tip: '退款已原路退回，请查收' }
};
const STATIC_ORDERS = [
    {
        id: 'ZX202410180001',
        status: 'fulfilled',
        createdAt: '2025-03-18T13:20:00+08:00',
        items: [
            { title: '招牌原味中江挂面（8束装）', qty: 2, price: 1890, amount: 3780 },
            { title: '川味牛肉浇头礼盒', qty: 1, price: 2680, amount: 2680 }
        ],
        amounts: {
            goods: 6460,
            freight: 0,
            discount: 500,
            payable: 5960
        },
        address: {
            name: '陈晓东',
            phone: '138****6102',
            province: '四川省',
            city: '德阳市',
            district: '中江县',
            detail: '凯江镇文化路 56 号'
        }
    },
    {
        id: 'ZX202410150027',
        status: 'paid',
        createdAt: '2025-03-15T19:45:00+08:00',
        items: [
            { title: '手工鸡蛋面礼盒（12 束）', qty: 1, price: 3290, amount: 3290 },
            { title: '椒麻红油拌料（6 袋装）', qty: 1, price: 1290, amount: 1290 }
        ],
        amounts: {
            goods: 4580,
            freight: 800,
            discount: 800,
            payable: 4580
        },
        address: {
            name: '李微',
            phone: '187****9920',
            province: '重庆市',
            city: '江北区',
            district: '观音桥街道',
            detail: '未来国际 A 座 1402'
        }
    },
    {
        id: 'ZX202410090012',
        status: 'pending',
        createdAt: '2025-03-09T08:35:00+08:00',
        items: [
            { title: '经典酱香面礼包（6 人份）', qty: 1, price: 2890, amount: 2890 },
            { title: '熬制骨汤底料（家庭桶）', qty: 1, price: 1990, amount: 1990 }
        ],
        amounts: {
            goods: 4880,
            freight: 0,
            discount: 0,
            payable: 4880
        },
        address: {
            name: '赵婷',
            phone: '151****0883',
            province: '四川省',
            city: '成都市',
            district: '锦江区',
            detail: '天府广场人民东路 33 号'
        }
    },
    {
        id: 'ZX202409280066',
        status: 'refunded',
        createdAt: '2025-02-28T17:18:00+08:00',
        items: [
            { title: '细滑龙须面（10 束装）', qty: 3, price: 1590, amount: 4770 },
            { title: '烟熏椒粉调味包', qty: 2, price: 690, amount: 1380 }
        ],
        amounts: {
            goods: 6150,
            freight: 0,
            discount: 0,
            payable: 6150
        },
        address: {
            name: '周凯',
            phone: '139****3255',
            province: '广东省',
            city: '深圳市',
            district: '南山区',
            detail: '科技园深南大道 9999 号'
        }
    },
    {
        id: 'ZX202409210043',
        status: 'canceled',
        createdAt: '2025-02-21T11:02:00+08:00',
        items: [
            { title: '鲜香骨汤拌粉（5 份）', qty: 1, price: 1990, amount: 1990 }
        ],
        amounts: {
            goods: 1990,
            freight: 0,
            discount: 0,
            payable: 1990
        },
        address: {
            name: '王蕾',
            phone: '136****7718',
            province: '湖南省',
            city: '长沙市',
            district: '岳麓区',
            detail: '银盆岭街道枫林路 88 号'
        }
    },
    {
        id: 'ZX202409120018',
        status: 'fulfilled',
        createdAt: '2025-02-12T09:28:00+08:00',
        items: [
            { title: '原味挂面便携包（15 袋）', qty: 1, price: 3590, amount: 3590 },
            { title: '藤椒牛油拌酱', qty: 2, price: 890, amount: 1780 }
        ],
        amounts: {
            goods: 5370,
            freight: 1200,
            discount: 700,
            payable: 5870
        },
        address: {
            name: '刘畅',
            phone: '152****0415',
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            detail: '望京街道广顺北大街 20 号'
        }
    }
];
function formatPrice(cents) {
    if (typeof cents !== 'number')
        return '--';
    return `¥${(cents / 100).toFixed(2)}`;
}
function formatDateTime(value) {
    if (!value)
        return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return undefined;
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function buildOrderCard(order) {
    var _a;
    const total = formatPrice((_a = order.amounts) === null || _a === void 0 ? void 0 : _a.payable);
    const status = order.status || 'pending';
    const statusText = STATUS_LABELS[status] || status;
    const statusMeta = STATUS_META[status] || STATUS_META.pending;
    const address = order.address;
    const addressLine = address
        ? [address.province, address.city, address.district, address.detail].filter(Boolean).join(' ')
        : undefined;
    const recipient = address ? [address.name, address.phone].filter(Boolean).join(' · ') : undefined;
    const items = (order.items || []).map((item) => ({
        title: item.title,
        qty: item.qty,
        priceText: formatPrice(item.price)
    }));
    const itemCount = (order.items || []).reduce((sum, item) => sum + ((item && item.qty) || 0), 0);
    const createdAtText = formatDateTime(order.createdAt);
    return {
        id: order.id || '',
        status,
        statusText,
        statusClass: statusMeta.className,
        statusTip: statusMeta.tip,
        total,
        items,
        itemCount,
        createdAt: createdAtText ? `下单时间 ${createdAtText}` : undefined,
        addressLine,
        recipient
    };
}
Page({
    data: {
        loading: false,
        page: 1,
        size: PAGE_SIZE,
        total: 0,
        hasMore: true,
        orders: [],
        displayOrders: []
    },
    onShow() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.refresh();
        });
    },
    onPullDownRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.refresh();
            wx.stopPullDownRefresh();
        });
    },
    onReachBottom() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data.hasMore || this.data.loading)
                return;
            yield this.loadOrders({ page: this.data.page, size: this.data.size });
        });
    },
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setData({ page: 1, hasMore: true, orders: [], displayOrders: [] });
            yield this.loadOrders({ page: 1, size: this.data.size }, true);
        });
    },
    loadOrders(params_1) {
        return __awaiter(this, arguments, void 0, function* (params, reset = false) {
            var _a, _b;
            if (this.data.loading)
                return;
            this.setData({ loading: true });
            const currentPage = (_a = params.page) !== null && _a !== void 0 ? _a : 1;
            const pageSize = (_b = params.size) !== null && _b !== void 0 ? _b : this.data.size;
            let fetched = [];
            let total = 0;
            let useStatic = false;
            try {
                const response = yield (0, api_1.myOrders)({
                    page: currentPage,
                    size: pageSize,
                    status: params.status
                });
                fetched = (response === null || response === void 0 ? void 0 : response.items) || [];
                total = typeof (response === null || response === void 0 ? void 0 : response.total) === 'number' ? response.total : fetched.length;
                if (!fetched.length) {
                    useStatic = true;
                }
            }
            catch (error) {
                useStatic = true;
            }
            if (useStatic) {
                const start = (currentPage - 1) * pageSize;
                const end = start + pageSize;
                fetched = STATIC_ORDERS.slice(start, end);
                total = STATIC_ORDERS.length;
            }
            const orders = reset ? fetched : this.data.orders.concat(fetched);
            const hasMore = orders.length < total;
            this.setData({
                loading: false,
                orders,
                displayOrders: orders.map(buildOrderCard),
                total,
                hasMore,
                page: hasMore ? currentPage + 1 : currentPage
            });
        });
    }
});
