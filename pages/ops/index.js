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
const STATIC_DASHBOARD = {
    operations: {
        onlineSlots: 3,
        slots: [
            {
                id: 'ops-live-room',
                name: '品牌直播间',
                description: '暖场预告 + 主播实操，聚焦新客上新',
                online: true
            },
            {
                id: 'ops-study-booking',
                name: '研学体验预约',
                description: '研学小程序 H5 同步上线，余位实时回捞',
                online: true
            },
            {
                id: 'ops-channel-health',
                name: '渠道动销速报',
                description: '县域团购渠道补货提醒，TOP3 SKU 动销 87%',
                online: true
            }
        ]
    },
    orders: {
        pending: 18
    },
    alerts: {
        today: 2
    },
    moderation: {
        pending: 5
    },
    pendingTasks: 3
};
const STATIC_TASKS = [
    {
        id: 'task-ugc-20251018',
        title: '审核新品体验官图文',
        description: '社区用户上传“麦香研学记”需完成图文复核与打标',
        typeLabel: '内容审核',
        priorityLabel: '高'
    },
    {
        id: 'task-slot-20251018',
        title: '更新首页运营位文案',
        description: '面里精选上线秋季礼盒，需更新 Banner 与 CTA',
        typeLabel: '运营位置',
        priorityLabel: '中'
    },
    {
        id: 'task-stock-20251017',
        title: '同步发货库存',
        description: '仓配系统回传延迟，需手动同步热销 SKU 库存快照',
        typeLabel: '库存同步',
        priorityLabel: '中'
    }
];
const STATIC_LOGS = [
    {
        id: 'log-risk-20251018-1',
        title: '异常支付波动',
        description: '15:20 检测到支付成功率下降 8%，已联络支付网关核查。',
        timestampText: '2025-10-18 15:25'
    },
    {
        id: 'log-risk-20251018-2',
        title: '内容敏感词拦截',
        description: '“直播秒杀”评论区触发敏感词策略，12 条评论已拦截。',
        timestampText: '2025-10-18 14:58'
    },
    {
        id: 'log-risk-20251017-1',
        title: '库存预警 - 手工龙须面',
        description: '渠道库存跌至 48 件，已推送补货提醒至仓配群。',
        timestampText: '2025-10-17 20:15'
    }
];
const STATIC_PRODUCT_METRICS = [
    {
        id: 'metric-classic',
        name: '招牌原味挂面 8 束装',
        value: '日销 1,280 份',
        deltaText: '环比 +18%',
        deltaType: 'up',
        note: '拼团入口贡献 42% 订单，建议保持首页露出。'
    },
    {
        id: 'metric-giftbox',
        name: '古法礼盒（臻享版）',
        value: '客单价 ¥258',
        deltaText: '转化 +9%',
        deltaType: 'up',
        note: '直播间秒杀氛围带动，需预留 60 份补货。'
    },
    {
        id: 'metric-condiment',
        name: '椒麻红油拌料',
        value: '库存 312 盒',
        deltaText: '消耗 65 盒',
        deltaType: 'flat',
        note: '库存充足，可搭配礼盒进行捆绑促销。'
    }
];
const initialData = {
    loading: true,
    dashboard: null,
    tasks: [],
    logs: [],
    productMetrics: []
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
                const [dashboardRes, tasksRes, logsRes] = yield Promise.all([
                    (0, api_1.getOpsDashboard)(),
                    (0, api_1.listOpsTasks)(),
                    (0, api_1.listOpsLogs)()
                ]);
                const resolvedDashboard = {
                    operations: {
                        onlineSlots: (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.operations)
                            && typeof (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.operations.onlineSlots) === 'number'
                            ? dashboardRes.operations.onlineSlots
                            : STATIC_DASHBOARD.operations.onlineSlots,
                        slots: (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.operations)
                            && Array.isArray(dashboardRes.operations.slots)
                            && (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.operations.slots.length)
                            ? dashboardRes.operations.slots
                            : STATIC_DASHBOARD.operations.slots
                    },
                    orders: {
                        pending: (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.orders)
                            && typeof (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.orders.pending) === 'number'
                            ? dashboardRes.orders.pending
                            : STATIC_DASHBOARD.orders.pending
                    },
                    alerts: {
                        today: (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.alerts)
                            && typeof (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.alerts.today) === 'number'
                            ? dashboardRes.alerts.today
                            : STATIC_DASHBOARD.alerts.today
                    },
                    moderation: {
                        pending: (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.moderation)
                            && typeof (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.moderation.pending) === 'number'
                            ? dashboardRes.moderation.pending
                            : STATIC_DASHBOARD.moderation.pending
                    },
                    pendingTasks: typeof (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.pendingTasks) === 'number'
                        ? dashboardRes.pendingTasks
                        : STATIC_DASHBOARD.pendingTasks
                };
                const resolvedTasks = (tasksRes === null || tasksRes === void 0 ? void 0 : tasksRes.items) && tasksRes.items.length
                    ? tasksRes.items
                    : STATIC_TASKS;
                const resolvedLogs = (logsRes === null || logsRes === void 0 ? void 0 : logsRes.items) && logsRes.items.length
                    ? logsRes.items
                    : STATIC_LOGS;
                const dynamicMetrics = (dashboardRes === null || dashboardRes === void 0 ? void 0 : dashboardRes.products)
                    && Array.isArray(dashboardRes.products.metrics)
                    ? dashboardRes.products.metrics
                    : [];
                const resolvedProductMetrics = dynamicMetrics.length
                    ? dynamicMetrics.map((metric, index) => ({
                        id: metric.id || `dynamic-metric-${index}`,
                        name: metric.name || metric.title || '重点产品',
                        value: metric.valueText || metric.value || '--',
                        deltaText: metric.deltaText || metric.trendText || '暂无趋势',
                        deltaType: metric.deltaType === 'down' || metric.deltaType === 'flat' ? metric.deltaType : 'up',
                        note: metric.note || metric.remark || ''
                    }))
                    : STATIC_PRODUCT_METRICS;
                this.setData({
                    dashboard: resolvedDashboard,
                    tasks: resolvedTasks,
                    logs: resolvedLogs,
                    productMetrics: resolvedProductMetrics
                });
            }
            catch (error) {
                wx.showToast({ title: '运营数据加载失败', icon: 'none' });
                this.setData({
                    dashboard: STATIC_DASHBOARD,
                    tasks: STATIC_TASKS,
                    logs: STATIC_LOGS,
                    productMetrics: STATIC_PRODUCT_METRICS
                });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    handleTaskAction(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, action } = event.currentTarget.dataset;
            if (!id)
                return;
            try {
                yield (0, api_1.updateOpsTaskStatus)({ id, action });
                wx.showToast({ title: '操作成功', icon: 'success' });
                yield this.bootstrap();
            }
            catch (error) {
                wx.showToast({ title: '操作失败', icon: 'none' });
            }
        });
    },
    handleToggleSlot(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slotId, enable } = event.currentTarget.dataset;
            if (!slotId)
                return;
            try {
                yield (0, api_1.toggleOperationSlot)({ slotId, enable });
                wx.showToast({ title: enable ? '已上线' : '已下线', icon: 'success' });
                yield this.bootstrap();
            }
            catch (error) {
                wx.showToast({ title: '更新失败', icon: 'none' });
            }
        });
    },
    handleSyncInventory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, api_1.syncInventorySnapshot)();
                wx.showToast({ title: '库存同步成功', icon: 'success' });
                yield this.bootstrap();
            }
            catch (error) {
                wx.showToast({ title: '同步失败', icon: 'none' });
            }
        });
    }
});
