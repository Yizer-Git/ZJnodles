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
    const items = (order.items || []).map((item) => ({
        title: item.title,
        qty: item.qty
    }));
    const status = order.status || 'pending';
    const statusText = STATUS_LABELS[status] || status;
    return {
        id: order.id || '',
        status,
        statusText,
        total,
        items,
        createdAt: formatDateTime(order.createdAt)
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
            try {
                const currentPage = (_a = params.page) !== null && _a !== void 0 ? _a : 1;
                const response = yield (0, api_1.myOrders)({
                    page: currentPage,
                    size: (_b = params.size) !== null && _b !== void 0 ? _b : this.data.size,
                    status: params.status
                });
                const fetched = (response === null || response === void 0 ? void 0 : response.items) || [];
                const total = typeof (response === null || response === void 0 ? void 0 : response.total) === 'number' ? response.total : fetched.length;
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
            }
            catch (error) {
                this.setData({ loading: false });
                wx.showToast({ title: '订单加载失败', icon: 'none' });
            }
        });
    }
});
