import {
  listHeritageScenes,
  listHeritageMissions,
  listHeritageBadges,
  type HeritageScene,
  type HeritageMission,
  type HeritageBadge
} from '../../services/api';

interface HallPageData {
  loading: boolean;
  scenes: HeritageScene[];
  missions: HeritageMission[];
  badges: HeritageBadge[];
  activeScene: HeritageScene | null;
  showMissionDrawer: boolean;
}

const initialData: HallPageData = {
  loading: true,
  scenes: [],
  missions: [],
  badges: [],
  activeScene: null,
  showMissionDrawer: false
};

Page({
  data: { ...initialData },
  async onLoad() {
    await this.bootstrap();
  },
  async onPullDownRefresh() {
    await this.bootstrap();
    wx.stopPullDownRefresh();
  },
  async bootstrap() {
    this.setData({ loading: true });
    try {
      const [sceneRes, missionRes, badgeRes] = await Promise.all([
        listHeritageScenes(),
        listHeritageMissions(),
        listHeritageBadges()
      ]);
      this.setData({
        scenes: sceneRes.items || [],
        missions: missionRes.items || [],
        badges: badgeRes.items || []
      });
    } catch (error) {
      wx.showToast({ title: '体验馆内容加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  handleSceneTap(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
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
  startMission(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    const mission = this.data.missions.find((item) => item.id === id);
    if (!mission) return;
    wx.showToast({
      title: mission.title ? `已开启「${mission.title}」` : '任务已开启',
      icon: 'success'
    });
  },
  shareBadge(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    const badge = this.data.badges.find((item) => item.id === id);
    if (!badge) return;
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
