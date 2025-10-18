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
    profile: null,
    feeds: [],
    tasks: [],
    mall: [],
    showTaskSheet: false,
    activeTask: null
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
                const [profile, feeds, tasks, mall] = yield Promise.all([
                    (0, api_1.getMemberProfile)(),
                    (0, api_1.listCommunityFeeds)(),
                    (0, api_1.listMemberTasks)(),
                    (0, api_1.listPointMall)()
                ]);
                this.setData({
                    profile,
                    feeds: feeds.items || [],
                    tasks: tasks.items || [],
                    mall: mall.items || []
                });
            }
            catch (error) {
                wx.showToast({ title: '社区数据加载失败', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    handleCheckIn() {
        wx.showToast({ title: '今日签到成功 ×10积分', icon: 'success' });
    },
    viewTask(event) {
        const { id } = event.currentTarget.dataset;
        const activeTask = this.data.tasks.find((item) => item.id === id) || null;
        this.setData({ showTaskSheet: !!activeTask, activeTask });
    },
    closeTaskSheet() {
        this.setData({ showTaskSheet: false, activeTask: null });
    },
    acceptTask() {
        const { activeTask } = this.data;
        if (!activeTask)
            return;
        wx.showToast({
            title: activeTask.name ? `任务「${activeTask.name}」已领取` : '任务已领取',
            icon: 'success'
        });
        this.closeTaskSheet();
    },
    redeemReward(event) {
        const { id } = event.currentTarget.dataset;
        const item = this.data.mall.find((entry) => entry.id === id);
        if (!item)
            return;
        wx.showToast({
            title: item.title ? `兑换成功：${item.title}` : '兑换成功',
            icon: 'success'
        });
    }
});
