const {
  listHeritageScenes,
  listHeritageMissions,
  listHeritageBadges,
  listContents
} = require('../../services/api');
const { backgroundAssets, hallPatternAssets } = require('../../utils/backgrounds');

const DEFAULT_FEED_TABS = ['全部', '非遗要闻', '匠心技艺', '研学活动'];

const HERITAGE_NAV_CARDS = [
  {
    id: 'nav-craft',
    title: '非遗面艺',
    desc: '匠心手作',
    icon: '/assets/images/icons/classic-chinese/002-bowl.svg',
    toast: '走进面艺工坊的匠心细节'
  },
  {
    id: 'nav-experience',
    title: '堂食体验',
    desc: '沉浸味旅',
    icon: '/assets/images/icons/classic-chinese/tea-desk.svg',
    toast: '即刻预览馆内沉浸式场景'
  },
  {
    id: 'nav-display',
    title: '空间陈设',
    desc: '器物雅陈',
    icon: '/assets/images/icons/classic-chinese/entry-cabinet.svg',
    toast: '探访传承人的器物故事'
  },
  {
    id: 'nav-study',
    title: '研学路线',
    desc: '体验导览',
    icon: '/assets/images/icons/classic-chinese/hanging-rack.svg',
    toast: '规划一场非遗研学之旅'
  }
];

const HERITAGE_STORY_PANELS = [
  {
    id: 'story-master',
    title: '匠人访谈',
    desc: '炉火纯青的手艺传承',
    icon: '/assets/images/icons/classic-chinese/2-chinese-teapot.svg',
    toast: '倾听匠人茶叙里的守艺心'
  },
  {
    id: 'story-salon',
    title: '茶余话非遗',
    desc: '慢品器物与故事',
    icon: '/assets/images/icons/classic-chinese/tea-table.svg',
    toast: '细品器物故事的温度'
  },
  {
    id: 'story-light',
    title: '夜读档案',
    desc: '灯下翻阅旧时章程',
    icon: '/assets/images/icons/classic-chinese/table-lamp.svg',
    toast: '沉浸旧档案的时光流转'
  },
  {
    id: 'story-life',
    title: '非遗生活',
    desc: '日常里的人间烟火',
    icon: '/assets/images/icons/classic-chinese/dressing-table.svg',
    toast: '感受非遗融入日常的温柔'
  }
];

const HERITAGE_SERVICE_CARDS = [
  {
    id: 'service-appointment',
    title: '预约参观',
    desc: '提前留座',
    icon: '/assets/images/icons/classic-chinese/single-chair.svg',
    toast: '预约成功后将为您预留座位'
  },
  {
    id: 'service-rest',
    title: '等位茶歇',
    desc: '安心等待',
    icon: '/assets/images/icons/classic-chinese/stool.svg',
    toast: '等位区提供茶点与小憩'
  },
  {
    id: 'service-wardrobe',
    title: '衣物寄存',
    desc: '轻松游览',
    icon: '/assets/images/icons/classic-chinese/coat-rack.svg',
    toast: '衣物寄存让体验更自在'
  },
  {
    id: 'service-gift',
    title: '文创礼盒',
    desc: '桂香相伴',
    icon: '/assets/images/icons/classic-chinese/flower-stand.svg',
    toast: '带走一份非遗的味道'
  }
];

const HERITAGE_FOCUS_CARDS = [
  {
    id: 'focus-live',
    title: '非遗制作实景',
    desc: '视频长廊呈现匠人手势、竹筛、麦香与蒸汽',
    highlights: ['3机位4K实时直播', '匠师语音讲解', '温湿度全域监测']
  },
  {
    id: 'focus-ops',
    title: '运营看板',
    desc: '宣传、直播、研学体验位实时掌控',
    highlights: ['今日预约 126 组', '研学打卡完成率 92%', '直播互动 3.2 万次']
  },
  {
    id: 'focus-goods',
    title: '非遗好物精选',
    desc: '古法晾晒的味道，加一抹青蓝与暖珐琅',
    highlights: ['限量挂面礼盒', '匠师签名木匣', '配套品鉴手册'],
    cta: {
      text: '进里面精选',
      target: '/pages/products/index',
      type: 'tab'
    }
  }
];

const LOCAL_FEED_FALLBACK = [
  {
    id: 'heritage-local-0',
    title: '中江挂面非遗工坊开放日',
    cover: '/assets/images/promo-images/0.png',
    summary: '走进非遗挂面工坊，沉浸体验晒场、揉面与晾挂工序，探索麦香背后的匠心。',
    tag: '非遗要闻',
    category: '非遗要闻',
    publishTimeText: '今日更新',
    authorName: '非遗传习所',
    authorAvatar: '/assets/avatar-placeholder.jpg',
    authorRole: '非遗讲述者',
    views: 2680,
    likes: 312,
    comments: 45,
    tags: ['非遗要闻']
  },
  {
    id: 'heritage-local-1',
    title: '匠师手作：冬日晒面纪录',
    cover: '/assets/images/promo-images/1.png',
    summary: '严选冬日晴朗时辰，匠师以代代相传的手法将挂面晾晒至筋道入味。',
    tag: '匠心技艺',
    category: '匠心技艺',
    publishTimeText: '本周热点',
    authorName: '挂面守艺人',
    authorAvatar: '/assets/avatar-placeholder.jpg',
    authorRole: '高级工艺师',
    views: 1984,
    likes: 256,
    comments: 38,
    tags: ['匠心技艺']
  },
  {
    id: 'heritage-local-2',
    title: '研学之旅：亲手擀面体验课',
    cover: '/assets/images/promo-images/2.png',
    summary: '面向青少年开放的研学项目，现场学习擀面、晾晒与调味，感受味蕾与文化共鸣。',
    tag: '研学活动',
    category: '研学活动',
    publishTimeText: '昨日发布',
    authorName: '研学营队长',
    authorAvatar: '/assets/avatar-placeholder.jpg',
    authorRole: '研学导师',
    views: 1520,
    likes: 188,
    comments: 26,
    tags: ['研学活动']
  }
];

const initialData = {
  loading: true,
  scenes: [],
  missions: [],
  badges: [],
  feeds: [],
  feedTabs: [...DEFAULT_FEED_TABS],
  activeFeedTab: DEFAULT_FEED_TABS[0],
  displayFeeds: [],
  activeScene: null,
  showMissionDrawer: false,
  backgrounds: backgroundAssets,
  hallPatterns: hallPatternAssets
};

Page({
  data: {
    ...initialData,
    navCards: HERITAGE_NAV_CARDS,
    storyPanels: HERITAGE_STORY_PANELS,
    serviceCards: HERITAGE_SERVICE_CARDS,
    heritageFocusCards: HERITAGE_FOCUS_CARDS
  },
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
      const [sceneRes, missionRes, badgeRes, feedRes] = await Promise.all([
        listHeritageScenes().catch(() => ({ items: [] })),
        listHeritageMissions().catch(() => ({ items: [] })),
        listHeritageBadges().catch(() => ({ items: [] })),
        listContents({ page: 1, size: 6, tag: 'heritage' }).catch(() => ({
          items: []
        }))
      ]);
      const remoteFeeds = (feedRes.items || []).map(transformContentToFeed);
      const feeds = remoteFeeds.length ? remoteFeeds : LOCAL_FEED_FALLBACK;
      const derivedTabs = Array.from(
        new Set(
          feeds
            .map((feed) => feed.tag || feed.category)
            .filter((value) => !!value)
        )
      );
      const feedTabs = [...new Set([DEFAULT_FEED_TABS[0], ...derivedTabs, ...DEFAULT_FEED_TABS.slice(1)])];
      const activeFeedTab =
        feedTabs.includes(this.data.activeFeedTab) && this.data.activeFeedTab
          ? this.data.activeFeedTab
          : feedTabs[0];
      const displayFeeds = this.filterFeeds(feeds, activeFeedTab);
      this.setData({
        scenes: sceneRes.items || [],
        missions: missionRes.items || [],
        badges: badgeRes.items || [],
        feeds,
        feedTabs,
        activeFeedTab,
        displayFeeds
      });
    } catch (error) {
      wx.showToast({ title: '体验馆内容加载失败', icon: 'none' });
      const feeds = LOCAL_FEED_FALLBACK;
      const feedTabs = [
        ...new Set([
          DEFAULT_FEED_TABS[0],
          ...feeds.map((feed) => feed.tag || feed.category).filter((value) => !!value),
          ...DEFAULT_FEED_TABS.slice(1)
        ])
      ];
      this.setData({
        scenes: [],
        missions: [],
        badges: [],
        feeds,
        feedTabs,
        activeFeedTab: feedTabs[0],
        displayFeeds: feeds
      });
    } finally {
      this.setData({ loading: false });
    }
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
  handleNavTap(event) {
    const { id } = event.currentTarget.dataset;
    const nav = this.data.navCards.find((item) => item.id === id);
    if (!nav) return;
    wx.showToast({
      title: nav.toast || nav.title,
      icon: 'none'
    });
  },
  handleStoryTap(event) {
    const { id } = event.currentTarget.dataset;
    const panel = this.data.storyPanels.find((item) => item.id === id);
    if (!panel) return;
    wx.showToast({
      title: panel.toast || panel.title,
      icon: 'none'
    });
  },
  handleServiceTap(event) {
    const { id } = event.currentTarget.dataset;
    const service = this.data.serviceCards.find((item) => item.id === id);
    if (!service) return;
    wx.showToast({
      title: service.toast || service.title,
      icon: 'none'
    });
  },
  handleFocusCardTap(event) {
    const { id } = event.currentTarget.dataset;
    const card = this.data.heritageFocusCards.find((item) => item.id === id);
    if (!card) {
      return;
    }
    if (card.cta && card.cta.target) {
      if (card.cta.type === 'tab') {
        wx.switchTab({ url: card.cta.target });
      } else {
        wx.navigateTo({ url: card.cta.target });
      }
      return;
    }
    wx.showToast({
      title: (card.toast || card.desc || card.title).slice(0, 20),
      icon: 'none'
    });
  },
  startMission(event) {
    const { id } = event.currentTarget.dataset;
    const mission = this.data.missions.find((item) => item.id === id);
    if (!mission) return;
    wx.showToast({
      title: mission.title ? `已开启「${mission.title}」` : '任务已开启',
      icon: 'success'
    });
  },
  shareBadge(event) {
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
    const normalized = tab.replace(/\s+/g, '').toLowerCase();
    return feeds.filter((feed) => {
      const extraTags = Array.isArray(feed.tags) ? feed.tags.join(',') : '';
      const target = `${feed.tag || ''}${feed.category || ''}${extraTags}`
        .replace(/\s+/g, '')
        .toLowerCase();
      if (!target) {
        return true;
      }
      return target.includes(normalized);
    });
  }
});

function transformContentToFeed(content) {
  const anyContent = content || {};
  const rawTags = Array.isArray(anyContent.tags) ? anyContent.tags : [];
  const tags = rawTags.filter((item) => typeof item === 'string');
  const category = anyContent.categoryLabel || anyContent.category || tags[0] || '';
  const summary =
    anyContent.summary || anyContent.desc || anyContent.descHtml || anyContent.excerpt || '';
  return {
    id: anyContent.id || '',
    title: anyContent.title || anyContent.name || '非遗资讯',
    cover: anyContent.cover || anyContent.poster || anyContent.image,
    summary,
    tag: anyContent.tag || tags[0] || '',
    category,
    publishTimeText: anyContent.publishTimeText || anyContent.publishAt || anyContent.createdAtText,
    authorName: anyContent.author || anyContent.authorName,
    authorAvatar: anyContent.authorAvatar || anyContent.avatar,
    authorRole: anyContent.authorRole || anyContent.authorTitle,
    views: typeof anyContent.views === 'number' ? anyContent.views : anyContent.reads,
    likes: typeof anyContent.likes === 'number' ? anyContent.likes : anyContent.favorites,
    comments: typeof anyContent.comments === 'number' ? anyContent.comments : anyContent.replies,
    tags
  };
}

