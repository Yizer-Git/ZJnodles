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
    scenes: [],
    missions: [],
    badges: [],
    activeScene: null,
    showMissionDrawer: false
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
                const [sceneRes, missionRes, badgeRes] = yield Promise.all([
                    (0, api_1.listHeritageScenes)(),
                    (0, api_1.listHeritageMissions)(),
                    (0, api_1.listHeritageBadges)()
                ]);
                this.setData({
                    scenes: sceneRes.items || [],
                    missions: missionRes.items || [],
                    badges: badgeRes.items || []
                });
            }
            catch (error) {
                wx.showToast({ title: '体验馆内容加载失败', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    handleSceneTap(event) {
        const { id } = event.currentTarget.dataset;
        const activeScene = this.data.scenes.find((item) => item.id === id) || null;
        this.setData({ activeScene });
    },
    closeScenePreview() {
        this.setData({ activeScene: null });
    },
    openMissionDrawer() {
        this.setData({ showMissionDrawer: true });
    },
    closeMissionDrawer() {
        this.setData({ showMissionDrawer: false });
    },
    startMission(event) {
        const { id } = event.currentTarget.dataset;
        const mission = this.data.missions.find((item) => item.id === id);
        if (!mission)
            return;
        wx.showToast({
            title: mission.title ? `已开启「${mission.title}」` : '任务已开启',
            icon: 'success'
        });
    },
    shareBadge(event) {
        const { id } = event.currentTarget.dataset;
        const badge = this.data.badges.find((item) => item.id === id);
        if (!badge)
            return;
        wx.showShareImageMenu({
            path: '/pages/hall/index',
            imageUrl: badge.icon || '',
            success() {
                wx.showToast({ title: '徽章分享成功', icon: 'success' });
            },
            fail() {
                wx.showToast({ title: '分享已取消', icon: 'none' });
            }
        });
    }
});
