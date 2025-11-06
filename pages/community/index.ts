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
  feedTabs: string[];
  activeFeedTab: string;
  displayFeeds: CommunityFeed[];
  showTaskSheet: boolean;
  activeTask: MemberTask | null;
}

const DEFAULT_FEED_TABS = ['全部', '活动速递', '非遗故事', '研学笔记'];

const initialData: CommunityPageData = {
  loading: true,
  profile: null,
  feeds: [],
  feedTabs: [...DEFAULT_FEED_TABS],
  activeFeedTab: DEFAULT_FEED_TABS[0],
  displayFeeds: [],
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
      const allFeeds = feeds.items || [];
      const activeFeedTab = this.data.activeFeedTab || DEFAULT_FEED_TABS[0];
      const feedTabs = this.data.feedTabs?.length ? this.data.feedTabs : [...DEFAULT_FEED_TABS];
      const displayFeeds = this.filterFeeds(allFeeds, activeFeedTab);
      this.setData({
        profile,
        feeds: allFeeds,
        displayFeeds,
        feedTabs,
        activeFeedTab,
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
  },
  handleFeedTabChange(event: WechatMiniprogram.TouchEvent<{ tab: string }>) {
    const { tab } = event.currentTarget.dataset;
    if (!tab || tab === this.data.activeFeedTab) {
      return;
    }
    const displayFeeds = this.filterFeeds(this.data.feeds, tab);
    this.setData({ activeFeedTab: tab, displayFeeds });
  },
  filterFeeds(feeds: CommunityFeed[], tab: string) {
    if (!tab || tab === DEFAULT_FEED_TABS[0]) {
      return feeds;
    }
    const normalizedTab = String(tab).replace(/\s+/g, '').toLowerCase();
    return feeds.filter((feed) => {
      const tagSource = [
        typeof (feed as Record<string, unknown>).category === 'string'
          ? ((feed as Record<string, unknown>).category as string)
          : '',
        typeof (feed as Record<string, unknown>).tag === 'string'
          ? ((feed as Record<string, unknown>).tag as string)
          : '',
        typeof (feed as Record<string, unknown>).type === 'string'
          ? ((feed as Record<string, unknown>).type as string)
          : ''
      ];
      const label = tagSource.find((value) => value) || '';
      const tags = Array.isArray((feed as Record<string, unknown>).tags)
        ? ((feed as Record<string, unknown>).tags as unknown[])
            .filter((entry) => typeof entry === 'string')
            .join(',')
        : '';
      const combined = `${label},${tags}`.replace(/\s+/g, '').toLowerCase();
      if (!combined) {
        return true;
      }
      return combined.includes(normalizedTab);
    });
  }
});
