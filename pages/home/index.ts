import {
  listContents,
  listProducts,
  loginByCode,
  getOpsDashboard
} from '../../services/api';
import type { Product, Content } from '../../services/api';
import { backgroundAssets } from '../../utils/backgrounds';

interface HomeContent {
  id: string;
  title?: string;
  cover?: string;
  description?: string;
  categoryLabel?: string;
}

interface HomeRecommendation extends HomeContent {
  priceText?: string;
  heritageLabel?: string;
  craftNote?: string;
}

interface HomeStory extends HomeContent {
  authorName?: string;
  authorAvatar?: string;
  views?: number;
  likes?: number;
  comments?: number;
  tags?: string[];
}

interface OperationSlot {
  id: string;
  name: string;
  description?: string;
  online?: boolean;
}

interface HomePageData {
  loading: boolean;
  contents: HomeContent[];
  recommendations: HomeRecommendation[];
  operations: OperationSlot[];
  campaign: HomeContent | null;
  showCampaign: boolean;
  heritageHighlights: HomeContent[];
  stories: HomeStory[];
  storyTabs: string[];
  activeStoryTab: string;
  displayStories: HomeStory[];
  backgrounds: typeof backgroundAssets;
}

const DEFAULT_STORY_TABS = ['全部', '传承人', '古法瞬间', '乡土风物'];
const DEFAULT_AUTHOR_AVATAR = '/assets/avatar-placeholder.jpg';
const STATIC_HERITAGE_HIGHLIGHTS: HomeContent[] = [
  {
    id: 'heritage-sunrise-workshop',
    title: '晨光抻面作坊',
    description: '传承人清晨抻面醒发，手势与竹筛配合让面身更筋道。',
    categoryLabel: '古法瞬间'
  },
  {
    id: 'heritage-steam-room',
    title: '蒸汽醒面间',
    description: '麦香随着蒸汽升腾，木质蒸柜保持着百年老灶的火候。',
    categoryLabel: '匠人日常'
  },
  {
    id: 'heritage-yard-drying',
    title: '廊檐日晒场',
    description: '一挂挂面条在竹竿上晾晒，廊檐下保持通风与恒温。',
    categoryLabel: '乡土风物'
  }
] as HomeContent[];

const STATIC_OPERATIONS: OperationSlot[] = [
  {
    id: 'ops-live-room',
    name: '品牌直播间',
    description: '今日两场暖场直播，累计 13,240 次观看，转化率 12.5%。',
    online: true
  },
  {
    id: 'ops-study-booking',
    name: '研学体验预约',
    description: '“麦香课堂”本周预约 96 人，明日场次余位 14。',
    online: true
  },
  {
    id: 'ops-channel-health',
    name: '渠道动销速报',
    description: '直营门店动销率 87%，县域团购补货单已生成。',
    online: true
  }
] as OperationSlot[];

async function ensureLogin() {
  try {
    const res = await wx.login();
    if (res.code) {
      const auth = await loginByCode({ code: res.code });
      if (auth && typeof auth === 'object' && 'token' in auth && auth.token) {
        wx.setStorageSync('token', auth.token);
      }
    }
  } catch (error) {
    console.log('login ignored', error);
  }
}

function convertProductToRecommendation(product: Product): HomeRecommendation {
  const price = (product.skus || [])
    .map((sku) => (typeof sku?.price === 'number' ? sku.price : undefined))
    .filter((value): value is number => typeof value === 'number');
  const minPrice = price.length ? Math.min(...price) : null;
  const desc =
    product.subtitle || (product as Record<string, any>).desc || (product as Record<string, any>).descHtml || '';
  const baseDesc = desc
    ? String(desc).replace(/<[^>]+>/g, '')
    : '匠人手作，中江挂面以日晒留住麦香。';
  const craftKeywords = '非遗古法 · 自然晾晒';
  const description = baseDesc.includes('非遗') ? baseDesc : `${baseDesc} · ${craftKeywords}`;
  return {
    id: product.id || '',
    title: product.title,
    cover: product.images?.[0],
    description,
    priceText: typeof minPrice === 'number' ? `¥${(minPrice / 100).toFixed(2)}` : undefined,
    heritageLabel: '非遗古法',
    craftNote: '自然晾晒'
  };
}

function transformContent(item: Content | HomeContent): HomeContent {
  const anyItem = item as Record<string, any>;
  return {
    id: anyItem.id || '',
    title: anyItem.title,
    cover: anyItem.cover || anyItem.poster,
    description: anyItem.summary || anyItem.desc || anyItem.descHtml || '',
    categoryLabel: anyItem.categoryLabel || anyItem.category || '精选'
  };
}

function transformContentToStory(item: Content): HomeStory {
  const anyItem = item as Record<string, any>;
  const tagsArray = Array.isArray(anyItem.tags)
    ? anyItem.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
    : [];
  const rawCategory =
    anyItem.storyCategory || anyItem.categoryLabel || anyItem.category || tagsArray[0] || '';
  const normalized = String(rawCategory).replace(/\s+/g, '').toLowerCase();
  let categoryLabel = String(rawCategory || '').trim();
  if (!categoryLabel) {
    if (normalized.includes('craft') || normalized.includes('工') || normalized.includes('晒')) {
      categoryLabel = '古法瞬间';
    } else if (normalized.includes('乡') || normalized.includes('村') || normalized.includes('旅')) {
      categoryLabel = '乡土风物';
    } else {
      categoryLabel = '传承人';
    }
  } else if (normalized.includes('匠') || normalized.includes('传承') || normalized.includes('人')) {
    categoryLabel = '传承人';
  } else if (normalized.includes('晒') || normalized.includes('工') || normalized.includes('艺')) {
    categoryLabel = '古法瞬间';
  } else if (normalized.includes('乡') || normalized.includes('村') || normalized.includes('风物')) {
    categoryLabel = '乡土风物';
  }

  const description =
    anyItem.summary || anyItem.desc || anyItem.descHtml || anyItem.excerpt || anyItem.intro || '';
  const cleanDescription = String(description)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    id: anyItem.id || '',
    title: anyItem.title || anyItem.name || '非遗故事',
    cover: anyItem.cover || anyItem.poster || anyItem.image || anyItem.banner,
    description: cleanDescription,
    categoryLabel,
    authorName: anyItem.authorName || anyItem.author || '匠人顾问',
    authorAvatar: anyItem.authorAvatar || anyItem.avatar || DEFAULT_AUTHOR_AVATAR,
    views: typeof anyItem.views === 'number' ? anyItem.views : anyItem.reads || 0,
    likes: typeof anyItem.likes === 'number' ? anyItem.likes : anyItem.favorites || 0,
    comments: typeof anyItem.comments === 'number' ? anyItem.comments : anyItem.replies || 0,
    tags: tagsArray
  };
}

function filterStories(stories: HomeStory[], tab: string) {
  if (!tab || tab === DEFAULT_STORY_TABS[0]) {
    return stories;
  }
  const normalizedTab = tab.replace(/\s+/g, '').toLowerCase();
  return stories.filter((story) => {
    const tagSource = [
      story.categoryLabel,
      ...(Array.isArray(story.tags) ? story.tags : [])
    ]
      .filter(Boolean)
      .join(',')
      .replace(/\s+/g, '')
      .toLowerCase();
    if (!tagSource) {
      return true;
    }
    return tagSource.includes(normalizedTab);
  });
}

const initialData: HomePageData = {
  loading: true,
  contents: [],
  recommendations: [],
  operations: [],
  campaign: null,
  showCampaign: false,
  heritageHighlights: [],
  stories: [],
  storyTabs: [...DEFAULT_STORY_TABS],
  activeStoryTab: DEFAULT_STORY_TABS[0],
  displayStories: [],
  backgrounds: backgroundAssets
};

Page({
  data: { ...initialData },
  async onLoad() {
    await ensureLogin();
    await this.bootstrap();
  },
  async onPullDownRefresh() {
    await this.bootstrap();
    wx.stopPullDownRefresh();
  },
  async bootstrap() {
    this.setData({ loading: true });
    try {
      const [contentRes, productRes, dashboard] = await Promise.all([
        listContents({ page: 1, size: 5 }),
        listProducts({ page: 1, size: 6 }),
        getOpsDashboard()
      ]);
      const rawContents = contentRes.items || [];
      const contents = rawContents.map(transformContent);
      const stories = rawContents.map(transformContentToStory);
      const recommendations = (productRes.items || []).map(convertProductToRecommendation);
      const heritageHighlights = contents.slice(0, 3);
      const highlights =
        heritageHighlights.length
          ? heritageHighlights
          : contents.length
          ? contents
          : STATIC_HERITAGE_HIGHLIGHTS;
      const campaign = highlights.length ? highlights[0] : null;
      const operations = (dashboard?.operations?.slots || []).map((slot: any) => ({
        id: slot.id,
        name: slot.name,
        description: slot.description,
        online: slot.online
      }));
      const resolvedOperations = operations.length ? operations : STATIC_OPERATIONS;
      const derivedTabs = Array.from(
        new Set(
          stories
            .map((story) => story.categoryLabel)
            .filter((value): value is string => !!value)
        )
      );
      const storyTabs = Array.from(
        new Set([...DEFAULT_STORY_TABS, ...derivedTabs])
      );
      const activeStoryTab =
        storyTabs.includes(this.data.activeStoryTab) && this.data.activeStoryTab
          ? this.data.activeStoryTab
          : storyTabs[0];
      const displayStories = filterStories(stories, activeStoryTab);
      this.setData({
        contents,
        recommendations,
        operations: resolvedOperations,
        campaign,
        showCampaign: !!campaign,
        heritageHighlights: highlights,
        stories,
        storyTabs,
        activeStoryTab,
        displayStories
      });
    } catch (error) {
      wx.showToast({ title: '首页内容加载失败', icon: 'none' });
      this.setData({
        operations: STATIC_OPERATIONS,
        heritageHighlights: STATIC_HERITAGE_HIGHLIGHTS,
        campaign: STATIC_HERITAGE_HIGHLIGHTS[0],
        showCampaign: true
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  closeCampaign() {
    this.setData({ showCampaign: false });
  },
  goProducts() {
    wx.switchTab({ url: '/pages/products/index' });
  },
  goHeritageStory() {
    wx.switchTab({ url: '/pages/hall/index' });
  },
  goCraftProcess() {
    wx.navigateTo({ url: '/pages/trace/index' });
  },
  goMasterArchive() {
    wx.navigateTo({ url: '/pages/study/index' });
  },
  goTrace() {
    wx.navigateTo({ url: '/pages/trace/index' });
  },
  goStudy() {
    wx.navigateTo({ url: '/pages/study/index' });
  },
  goBooking() {
    wx.navigateTo({ url: '/pages/booking/index' });
  },
  goCommunity() {
    wx.navigateTo({ url: '/pages/community/index' });
  },
  goOrders() {
    wx.navigateTo({ url: '/pages/orders/index' });
  },
  goOps() {
    wx.navigateTo({ url: '/pages/ops/index' });
  },
  goEnterprise() {
    wx.navigateTo({ url: '/pages/enterprise/index' });
  },
  goSearch() {
    wx.switchTab({ url: '/pages/products/index' });
  },
  handleStoryTabChange(event: WechatMiniprogram.TouchEvent<{ tab: string }>) {
    const { tab } = event.currentTarget.dataset;
    if (!tab || tab === this.data.activeStoryTab) {
      return;
    }
    const displayStories = filterStories(this.data.stories, tab);
    this.setData({ activeStoryTab: tab, displayStories });
  }
});
