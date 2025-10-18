import {
  getMemberProfile,
  listCommunityFeeds,
  listMemberTasks,
  listPointMall,
  type MemberProfile,
  type CommunityFeed,
  type MemberTask,
  type PointMallItem
} from '../../services/api';

interface CommunityPageData {
  loading: boolean;
  profile: MemberProfile | null;
  feeds: CommunityFeed[];
  tasks: MemberTask[];
  mall: PointMallItem[];
  showTaskSheet: boolean;
  activeTask: MemberTask | null;
}

const initialData: CommunityPageData = {
  loading: true,
  profile: null,
  feeds: [],
  tasks: [],
  mall: [],
  showTaskSheet: false,
  activeTask: null
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
      const [profile, feeds, tasks, mall] = await Promise.all([
        getMemberProfile(),
        listCommunityFeeds(),
        listMemberTasks(),
        listPointMall()
      ]);
      this.setData({
        profile,
        feeds: feeds.items || [],
        tasks: tasks.items || [],
        mall: mall.items || []
      });
    } catch (error) {
      wx.showToast({ title: '社区数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  handleCheckIn() {
    wx.showToast({ title: '今日签到成功 ×10积分', icon: 'success' });
  },
  viewTask(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    const activeTask = this.data.tasks.find((item) => item.id === id) || null;
    this.setData({ showTaskSheet: !!activeTask, activeTask });
  },
  closeTaskSheet() {
    this.setData({ showTaskSheet: false, activeTask: null });
  },
  acceptTask() {
    const { activeTask } = this.data;
    if (!activeTask) return;
    wx.showToast({
      title: activeTask.name ? `任务「${activeTask.name}」已领取` : '任务已领取',
      icon: 'success'
    });
    this.closeTaskSheet();
  },
  redeemReward(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    const item = this.data.mall.find((entry) => entry.id === id);
    if (!item) return;
    wx.showToast({
      title: item.title ? `兑换成功：${item.title}` : '兑换成功',
      icon: 'success'
    });
  }
});
