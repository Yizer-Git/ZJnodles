import { listProducts, type ListProductsParams, type Product } from '../../services/api';

const DEFAULT_PAGE_OPTIONS: ListProductsParams = { page: 1, size: 10 };
const DEFAULT_COVER = 'https://dummyimage.com/600x400/eee/aaa&text=ZHGM';
const FILTER_TABS = [
  { label: '热销推荐', value: 'hot' },
  { label: '新品上市', value: 'new' },
  { label: '组合套餐', value: 'bundle' },
  { label: '礼盒周边', value: 'gift' }
];

interface ProductCard {
  id: string;
  title?: string;
  subtitle?: string | null;
  cover: string;
  priceLabel: string;
  minPrice: number;
  tags: string[];
  heritageNote: string;
  craftNote: string;
}

interface ProductBundle {
  id: string;
  title: string;
  items: string;
  priceLabel: string;
  originalPriceLabel?: string;
  savingLabel?: string;
}

interface DiscountTip {
  label: string;
  description: string;
}

interface LogisticsItem {
  label: string;
  value: string;
}

interface ProductsPageData {
  loading: boolean;
  items: ProductCard[];
  rawProducts: Product[];
  filters: typeof FILTER_TABS;
  activeFilter: string;
  bundles: ProductBundle[];
  discountTips: DiscountTip[];
  logistics: LogisticsItem[];
}

function formatPrice(cents?: number) {
  if (typeof cents !== 'number') return '--';
  return `¥${(cents / 100).toFixed(2)}`;
}

function buildProductCard(product: Product): ProductCard {
  const cover = product.images && product.images.length > 0 ? product.images[0] : DEFAULT_COVER;
  const prices = (product.skus || [])
    .map((sku) => (typeof sku?.price === 'number' ? sku.price : undefined))
    .filter((price): price is number => typeof price === 'number');
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const baseSubtitle = product.subtitle || '匠人手工晾晒 · 入口回甘';
  const subtitle = baseSubtitle.includes('非遗') ? baseSubtitle : `${baseSubtitle} · 非遗古法`;
  const tags = [
    '非遗古法',
    '自然晾晒',
    product.tags?.[0],
    minPrice < 2999 ? '限时礼遇' : undefined
  ].filter(Boolean) as string[];

  return {
    id: product.id || '',
    title: product.title,
    subtitle,
    cover,
    minPrice,
    priceLabel: formatPrice(minPrice),
    tags,
    heritageNote: '匠人手作',
    craftNote: '竹架晾晒'
  };
}

function buildBundles(product: Product): ProductBundle[] {
  const base = product.title || '组合套餐';
  const skus = product.skus || [];
  if (!skus.length) return [];
  const first = skus[0];
  const second = skus[1] || first;
  const price = typeof first?.price === 'number' ? first.price : 0;
  const extra = typeof second?.price === 'number' ? second.price : price;
  const firstName = first && first.attrs ? Object.values(first.attrs).join('/') : '多份装';
  const secondName = second && second.attrs ? Object.values(second.attrs).join('/') : '体验装';
  const bundlePrice = Math.round((price + extra) * 0.9);

  return [{
    id: `${product.id}-bundle`,
    title: `${base}双人礼遇`,
    items: `${firstName} + ${secondName}`,
    priceLabel: formatPrice(bundlePrice),
    originalPriceLabel: formatPrice(price + extra),
    savingLabel: `立省${formatPrice(price + extra - bundlePrice)}`
  }];
}

function buildDiscountTips(product: Product): DiscountTip[] {
  const hasGroup = (product.skus || []).some((sku) => {
    const info = sku as Record<string, any>;
    return info?.minQuantity && info.minQuantity > 1;
  });
  return [
    { label: '满减', description: '满199减30 | 满299减60' },
    ...(hasGroup ? [{ label: '团购', description: '2件95折，5件9折' }] : []),
    { label: '叠加券', description: '新人券+节日券可叠加使用' }
  ];
}

const DEFAULT_LOGISTICS: LogisticsItem[] = [
  { label: '仓配', value: '四川/江苏双仓发货' },
  { label: '时效', value: '默认48小时内发货，节假日除外' },
  { label: '售后', value: '7天无忧退换，客服9:00-22:00在线' }
];

const initialData: ProductsPageData = {
  loading: false,
  items: [],
  rawProducts: [],
  filters: FILTER_TABS,
  activeFilter: FILTER_TABS[0].value,
  bundles: [],
  discountTips: [],
  logistics: DEFAULT_LOGISTICS
};

Page({
  data: { ...initialData },
  async onLoad() {
    await this.loadProducts();
  },
  async loadProducts(params: ListProductsParams = DEFAULT_PAGE_OPTIONS) {
    this.setData({ loading: true });
    try {
      const data = await listProducts(params);
      const products = data?.items || [];
      const cards = products.map(buildProductCard);
      const first = products[0];
      this.setData({
        rawProducts: products,
        items: cards,
        bundles: first ? buildBundles(first) : [],
        discountTips: first ? buildDiscountTips(first) : []
      });
    } catch (error) {
      wx.showToast({ title: '商品加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async handleFilterChange(event: WechatMiniprogram.TouchEvent<{ value: string }>) {
    const { value } = event.currentTarget.dataset;
    if (!value) return;
    this.setData({ activeFilter: value });
    await this.loadProducts({ ...DEFAULT_PAGE_OPTIONS, category: value } as ListProductsParams);
  },
  previewBundle(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    const bundle = this.data.bundles.find((item) => item.id === id);
    if (!bundle) return;
    wx.showModal({
      title: bundle.title,
      content: `${bundle.items}\n${bundle.priceLabel}（${bundle.savingLabel || '已优惠'}）`,
      showCancel: false
    });
  },
  showDiscountTips() {
    wx.showActionSheet({
      itemList: this.data.discountTips.map((tip) => `${tip.label}：${tip.description}`)
    });
  },
  addToCart(e: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = e.currentTarget.dataset;
    const product = this.data.rawProducts.find((item) => item.id === id);
    wx.showToast({
      title: product?.title ? `已加入：${product.title}` : '已加入购物车',
      icon: 'success'
    });
  },
  goToCheckout() {
    wx.navigateTo({ url: '/pages/orders/index' });
  }
});
