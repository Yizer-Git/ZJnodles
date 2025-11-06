import { listHeritageScenes, listHeritageMissions, listHeritageBadges, listContents } from '../../services/api';
import { backgroundAssets, hallPatternAssets } from '../../utils/backgrounds';
import type { HeritageScene, HeritageMission, HeritageBadge, Content } from '../../services/api';

interface HallPageData {
  loading: boolean;
  scenes: HeritageScene[];
  missions: HeritageMission[];
  badges: HeritageBadge[];
  feeds: HeritageFeed[];
  feedTabs: string[];
  activeFeedTab: string;
  displayFeeds: HeritageFeed[];
  activeScene: HeritageScene | null;
  showMissionDrawer: boolean;
  backgrounds: typeof backgroundAssets;
  hallPatterns: typeof hallPatternAssets;
}

interface HeritageFeed {
  id: string;
  title: string;
  cover?: string;
  summary?: string;
  tag?: string;
  category?: string;
  publishTimeText?: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  views?: number;
  likes?: number;
  comments?: number;
  tags?: string[];
}

const DEFAULT_FEED_TABS = ['全部', '非遗要闻', '匠心技艺', '研学活动'];

const LOCAL_FEED_FALLBACK: HeritageFeed[] = [
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

const initialData: HallPageData = {
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
            .filter((value): value is string => !!value)
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
      const feedTabs = [...new Set([DEFAULT_FEED_TABS[0], ...feeds.map((feed) => feed.tag || feed.category).filter((value): value is string => !!value), ...DEFAULT_FEED_TABS.slice(1)])];
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
  },
  handleFeedTabChange(event: WechatMiniprogram.TouchEvent<{ tab: string }>) {
    const { tab } = event.currentTarget.dataset;
    if (!tab || tab === this.data.activeFeedTab) {
      return;
    }
    const displayFeeds = this.filterFeeds(this.data.feeds, tab);
    this.setData({ activeFeedTab: tab, displayFeeds });
  },
  filterFeeds(feeds: HeritageFeed[], tab: string) {
    if (!tab || tab === DEFAULT_FEED_TABS[0]) {
      return feeds;
    }
    const normalized = tab.replace(/\s+/g, '').toLowerCase();
    return feeds.filter((feed) => {
      const target = `${feed.tag || ''}${feed.category || ''}${(feed.tags || []).join(',')}`
        .replace(/\s+/g, '')
        .toLowerCase();
      if (!target) {
        return true;
      }
      return target.includes(normalized);
    });
  }
});

function transformContentToFeed(content: Content | HeritageFeed): HeritageFeed {
  const anyContent = content as Record<string, any>;
  const tags: string[] = Array.isArray(anyContent.tags)
    ? anyContent.tags.filter((item: unknown): item is string => typeof item === 'string')
    : [];
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

