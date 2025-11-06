import { listProducts } from '../../services/api';
import type { ListProductsParams, Product } from '../../services/api';

const DEFAULT_PAGE_OPTIONS: ListProductsParams = { page: 1, size: 10 };
const DEFAULT_COVER = '/assets/images/product-images/19d9deb046197ca7aa255cba919c8a32.jpg';
const FILTER_TABS = [
  { label: '热销推荐', value: 'hot' },
  { label: '新品上市', value: 'new' },
  { label: '组合套餐', value: 'bundle' },
  { label: '礼盒周边', value: 'gift' }
];

const PRODUCT_BANNER_IMAGES = [
  '/assets/images/serving-suggestions/6_0.jpg',
  '/assets/images/serving-suggestions/6_2.jpg',
  '/assets/images/serving-suggestions/6_3.jpg',
  '/assets/images/serving-suggestions/6_4.jpg'
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

type LocalProduct = Product & {
  filterTags?: string[];
  heritageNote?: string;
  craftNote?: string;
};

const LOCAL_PRODUCTS: LocalProduct[] = [
  {
    id: 'local-heritage-gift',
    title: '非遗古法礼盒',
    subtitle: '匠人手作 · 实木礼盒收纳',
    images: ['/assets/images/product-images/19d9deb046197ca7aa255cba919c8a32.jpg'],
    tags: ['热销推荐', '实木礼盒', '伴手礼'],
    heritageNote: '礼盒甄选',
    craftNote: '原麦配方',
    skus: [
      {
        id: 'sku-local-heritage',
        price: 32800,
        attrs: { 规格: '6袋礼盒', 工艺: '日晒古法' }
      }
    ] as any,
    filterTags: ['hot', 'gift']
  } as unknown as LocalProduct,
  {
    id: 'local-new-bundle',
    title: '椒麻挂面试吃装',
    subtitle: '花椒提鲜 · 轻巧分装',
    images: ['/assets/images/product-images/4025ed4b0491026c9e22d865d6435584.jpeg'],
    tags: ['新品上市', '椒香', '轻食'],
    heritageNote: '椒香手工',
    craftNote: '即煮即享',
    skus: [
      {
        id: 'sku-local-new',
        price: 28900,
        attrs: { 口味: '花椒清香', 规格: '4袋装' }
      },
      {
        id: 'sku-local-new-plus',
        price: 35800,
        attrs: { 口味: '椒麻劲爽', 规格: '6袋装' }
      }
    ] as any,
    filterTags: ['new', 'bundle']
  } as unknown as LocalProduct,
  {
    id: 'local-bundle-family',
    title: '匠心家庭套餐',
    subtitle: '多口味搭配 · 家庭分享',
    images: ['/assets/images/product-images/4d52714b661caf20c0ddfbf86dba5652.jpg'],
    tags: ['组合套餐', '限时礼遇', '家庭量贩'],
    heritageNote: '家庭尊享',
    craftNote: '多味慢晒',
    skus: [
      {
        id: 'sku-local-family',
        price: 45900,
        attrs: { 规格: '8袋礼盒', 配料: '原味+荞麦' }
      },
      {
        id: 'sku-local-family-plus',
        price: 52800,
        attrs: { 规格: '12袋礼盒', 配料: '原味+青椒' }
      }
    ] as any,
    filterTags: ['bundle', 'gift', 'hot']
  } as unknown as LocalProduct
];

function pickLocalProducts(filter?: string): LocalProduct[] {
  if (!filter) {
    return LOCAL_PRODUCTS;
  }
  const matched = LOCAL_PRODUCTS.filter((item) => (item.filterTags || []).includes(filter));
  return matched.length ? matched : LOCAL_PRODUCTS;
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
  bannerImages: string[];
}

function formatPrice(cents?: number) {
  if (typeof cents !== 'number') return '--';
  return `¥${(cents / 100).toFixed(2)}`;
}

function buildProductCard(product: Product): ProductCard {
  const cover = product.images && product.images.length > 0 ? product.images[0] : DEFAULT_COVER;
  const local = product as LocalProduct;
  const prices = (product.skus || [])
    .map((sku) => (typeof sku?.price === 'number' ? sku.price : undefined))
    .filter((price): price is number => typeof price === 'number');
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const baseSubtitle = product.subtitle || '匠人手工晾晒 · 入口回甘';
  const subtitle = baseSubtitle.includes('非遗') ? baseSubtitle : `${baseSubtitle} · 非遗古法`;
  const rawTags = [
    '非遗古法',
    '自然晾晒',
    ...(Array.isArray(product.tags) ? product.tags : []),
    minPrice < 2999 ? '限时礼遇' : undefined
  ].filter((tag): tag is string => !!tag);
  const tags = Array.from(new Set(rawTags)).slice(0, 5);
  const heritageNote = local.heritageNote || '匠人手作';
  const craftNote = local.craftNote || '竹架晾晒';

  return {
    id: product.id || '',
    title: product.title,
    subtitle,
    cover,
    minPrice,
    priceLabel: formatPrice(minPrice),
    tags,
    heritageNote,
    craftNote
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
  logistics: DEFAULT_LOGISTICS,
  bannerImages: PRODUCT_BANNER_IMAGES
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
      let products = (data?.items || []) as (Product | LocalProduct)[];
      if (!products.length) {
        const filterValue = (params as Record<string, any>).category as string | undefined;
        products = pickLocalProducts(filterValue);
      }
      const cards = products.map(buildProductCard);
      const first = products[0];
      this.setData({
        rawProducts: products as Product[],
        items: cards,
        bundles: first ? buildBundles(first) : [],
        discountTips: first ? buildDiscountTips(first) : []
      });
    } catch (error) {
      wx.showToast({ title: '商品加载失败', icon: 'none' });
      const filterValue = (params as Record<string, any>).category as string | undefined;
      const products = pickLocalProducts(filterValue);
      const first = products[0] as Product | undefined;
      this.setData({
        rawProducts: products as Product[],
        items: products.map(buildProductCard),
        bundles: first ? buildBundles(first) : [],
        discountTips: first ? buildDiscountTips(first) : []
      });
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

