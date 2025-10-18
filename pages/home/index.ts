import {
  listContents,
  listProducts,
  loginByCode,
  getOpsDashboard,
  type Product,
  type Content
} from '../../services/api';

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
  cultureStories: HomeContent[];
}

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

const initialData: HomePageData = {
  loading: true,
  contents: [],
  recommendations: [],
  operations: [],
  campaign: null,
  showCampaign: false,
  heritageHighlights: [],
  cultureStories: []
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
      const contents = (contentRes.items || []).map(transformContent);
      const recommendations = (productRes.items || []).map(convertProductToRecommendation);
      const heritageHighlights = contents.slice(0, 3);
      const cultureStories = contents.slice(3);
      const highlights = heritageHighlights.length ? heritageHighlights : contents;
      const storyFeed = cultureStories.length ? cultureStories : contents;
      const campaign = highlights.length ? highlights[0] : null;
      const operations = (dashboard?.operations?.slots || []).map((slot: any) => ({
        id: slot.id,
        name: slot.name,
        description: slot.description,
        online: slot.online
      }));
      this.setData({
        contents,
        recommendations,
        operations,
        campaign,
        showCampaign: !!campaign,
        heritageHighlights: highlights,
        cultureStories: storyFeed
      });
    } catch (error) {
      wx.showToast({ title: '首页内容加载失败', icon: 'none' });
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
  goEnterprise() {
    wx.navigateTo({ url: '/pages/enterprise/index' });
  },
  goSearch() {
    wx.switchTab({ url: '/pages/products/index' });
  }
});
