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
const initialData = {
    loading: true,
    dashboard: null,
    tasks: [],
    logs: []
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
                const [dashboard, tasks, logs] = yield Promise.all([
                    (0, api_1.getOpsDashboard)(),
                    (0, api_1.listOpsTasks)(),
                    (0, api_1.listOpsLogs)()
                ]);
                this.setData({
                    dashboard,
                    tasks: tasks.items || [],
                    logs: logs.items || []
                });
            }
            catch (error) {
                wx.showToast({ title: '运营数据加载失败', icon: 'none' });
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
