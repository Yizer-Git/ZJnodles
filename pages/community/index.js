const {
  getMemberProfile,
  listCommunityFeeds,
  listMemberTasks,
  listPointMall
} = require('../../services/api');

const DEFAULT_FEED_TABS = ['全部', '活动速递', '非遗故事', '研学笔记'];

const STATIC_FEEDS = [
  {
    id: 'heritage-noodle-masterclass',
    title: '王凤强大师：一筷面体验课开启',
    summary:
      '王凤强大师分享制面技艺，从醒面到晾晒全流程开放报名，现场体验石磨碾粉与竹帘晾挂。',
    publishTimeText: '2小时前',
    category: '非遗故事',
    tag: '匠人访谈',
    authorName: '王凤强',
    authorRole: '省级非遗传承人',
    authorAvatar: '/assets/avatar-placeholder.jpg',
    cover: '/assets/images/promo-images/2.png',
    views: 382,
    likes: 67,
    comments: 14
  },
  {
    id: 'campus-study-tour',
    title: '研学笔记：十所高校走进中江挂面作坊',
    summary:
      '来自川渝高校的研学团完成制面闯关，记录下揉面、盘条、上杆的第一手观察。',
    publishTimeText: '昨天 16:20',
    category: '研学笔记',
    tag: '研学记实',
    authorName: '研学助教·吴晴',
    authorRole: '活动记录官',
    authorAvatar: '/assets/avatar-placeholder.jpg',
    cover: '/assets/images/promo-images/1.png',
    views: 521,
    likes: 92,
    comments: 26
  },
  {
    id: 'festival-market-pop-up',
    title: '活动速递：春日非遗市集快闪开幕',
    summary:
      '本周末在中江古井广场打造非遗市集，推出限量“挂面春盒”并设置社区打卡任务。',
    publishTimeText: '3天前',
    category: '活动速递',
    tag: '市集',
    authorName: '中江面旅社',
    authorRole: '官方团队',
    authorAvatar: '/assets/avatar-placeholder.jpg',
    cover: '/assets/images/promo-images/4.png',
    views: 764,
    likes: 138,
    comments: 41
  },
  {
    id: 'heritage-oral-history',
    title: '非遗故事：三代挂面匠的口述记忆',
    summary:
      '“面要活，手要软”，李家三代守住挂面配方，守护一方麦香，记录那道传家口令。',
    publishTimeText: '上周',
    category: '非遗故事',
    tag: '口述历史',
    authorName: '李春梅',
    authorRole: '社区纪事官',
    authorAvatar: '/assets/avatar-placeholder.jpg',
    cover: '/assets/images/promo-images/0.png',
    views: 1102,
    likes: 203,
    comments: 58
  }
];

const initialData = {
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
      const [profile, feedsRes, tasksRes, mallRes] = await Promise.all([
        getMemberProfile(),
        listCommunityFeeds(),
        listMemberTasks(),
        listPointMall()
      ]);
      const remoteFeeds = (feedsRes && feedsRes.items) || [];
      const allFeeds = remoteFeeds.length ? remoteFeeds : STATIC_FEEDS;
      const activeFeedTab = this.data.activeFeedTab || DEFAULT_FEED_TABS[0];
      const feedTabs =
        Array.isArray(this.data.feedTabs) && this.data.feedTabs.length
          ? this.data.feedTabs
          : [...DEFAULT_FEED_TABS];
      const displayFeeds = this.filterFeeds(allFeeds, activeFeedTab);
      this.setData({
        profile,
        feeds: allFeeds,
        feedTabs,
        activeFeedTab,
        displayFeeds,
        tasks: (tasksRes && tasksRes.items) || [],
        mall: (mallRes && mallRes.items) || []
      });
    } catch (error) {
      const activeFeedTab = this.data.activeFeedTab || DEFAULT_FEED_TABS[0];
      this.setData({
        feeds: STATIC_FEEDS,
        displayFeeds: this.filterFeeds(STATIC_FEEDS, activeFeedTab),
        activeFeedTab
      });
      wx.showToast({ title: '社区数据加载失败，已展示精选内容', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
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
    if (!activeTask) return;
    wx.showToast({
      title: activeTask.name ? `任务「${activeTask.name}」已领取` : '任务已领取',
      icon: 'success'
    });
    this.closeTaskSheet();
  },
  redeemReward(event) {
    const { id } = event.currentTarget.dataset;
    const item = this.data.mall.find((entry) => entry.id === id);
    if (!item) return;
    wx.showToast({
      title: item.title ? `兑换成功：${item.title}` : '兑换成功',
      icon: 'success'
    });
  },
  handleFeedTabChange(event) {
    const { tab } = event.currentTarget.dataset;
    if (!tab || tab === this.data.activeFeedTab) {
      return;
    }
    const displayFeeds = this.filterFeeds(this.data.feeds, tab);
    this.setData({ activeFeedTab: tab, displayFeeds });
  },
  filterFeeds(feeds, tab) {
    if (!tab || tab === DEFAULT_FEED_TABS[0]) {
      return feeds;
    }
    const normalizedTab = String(tab).replace(/\s+/g, '').toLowerCase();
    return feeds.filter((feed) => {
      const record = feed || {};
      const category =
        typeof record.category === 'string' ? record.category : '';
      const tag = typeof record.tag === 'string' ? record.tag : '';
      const type = typeof record.type === 'string' ? record.type : '';
      const tags = Array.isArray(record.tags)
        ? record.tags.filter((entry) => typeof entry === 'string').join(',')
        : '';
      const combined = `${category},${tag},${type},${tags}`
        .replace(/\s+/g, '')
        .toLowerCase();
      if (!combined) {
        return true;
      }
      return combined.includes(normalizedTab);
    });
  }
});
