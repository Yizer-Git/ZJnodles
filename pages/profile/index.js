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
const BASE_ENTRIES = [
    {
        id: 'orders',
        title: '我的订单',
        description: '支付、物流进度、售后',
        path: '/pages/orders/index'
    },
    {
        id: 'trace',
        title: '区块链溯源',
        description: '扫码查看批次与质检报告',
        path: '/pages/trace/index'
    },
    {
        id: 'study',
        title: '文旅研学',
        description: '预约行程、签到领取证书',
        path: '/pages/study/index'
    },
    {
        id: 'enterprise',
        title: '企业服务',
        description: '企业注册、合同签署与发票',
        path: '/pages/enterprise/index'
    },
    {
        id: 'ops',
        title: '运营后台',
        description: 'CMS/OMS配置与风控审计',
        path: '/pages/ops/index',
        roles: ['operator', 'admin']
    }
];
const initialData = {
    loading: true,
    user: null,
    member: null,
    ops: null,
    entries: BASE_ENTRIES
};
Page({
    data: Object.assign({}, initialData),
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
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
            this.setData({ loading: true });
            try {
                const [user, member, ops] = yield Promise.all([
                    (0, api_1.getCurrentUser)().catch(() => null),
                    (0, api_1.getMemberProfile)().catch(() => null),
                    (0, api_1.getOpsDashboard)().catch(() => null)
                ]);
                const roles = (user && 'roles' in user) ? user.roles : [];
                this.setData({
                    user,
                    member,
                    ops,
                    entries: BASE_ENTRIES.filter((entry) => {
                        if (!entry.roles)
                            return true;
                        return roles === null || roles === void 0 ? void 0 : roles.some((role) => entry.roles.includes(String(role)));
                    })
                });
            }
            catch (error) {
                wx.showToast({ title: '用户信息加载失败', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    handleEntryTap(event) {
        const { path, tab } = event.currentTarget.dataset;
        if (!path)
            return;
        if (tab) {
            wx.switchTab({ url: path });
            return;
        }
        wx.navigateTo({ url: path });
    },
    handleContactOps() {
        wx.showModal({
            title: '客服与对接',
            content: '请通过客服电话 400-123-1987 或企业微信联系运营团队.',
            showCancel: false
        });
    }
});
