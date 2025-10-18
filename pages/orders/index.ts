import { myOrders, type MyOrdersParams, type Order, type OrderStatus } from '../../services/api';

const PAGE_SIZE = 10;
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待确认',
  unpaid: '待支付',
  paid: '已支付',
  canceled: '已取消',
  fulfilled: '已完成',
  refunded: '已退款'
};

interface OrderItemSummary {
  title?: string;
  qty?: number;
}

interface OrderCard {
  id: string;
  status: OrderStatus | string;
  statusText: string;
  total: string;
  items: OrderItemSummary[];
  createdAt?: string;
}

interface OrdersPageData {
  loading: boolean;
  page: number;
  size: number;
  total: number;
  hasMore: boolean;
  orders: Order[];
  displayOrders: OrderCard[];
}

function formatPrice(cents?: number) {
  if (typeof cents !== 'number') return '--';
  return `¥${(cents / 100).toFixed(2)}`;
}

function formatDateTime(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildOrderCard(order: Order): OrderCard {
  const total = formatPrice(order.amounts?.payable);
  const items = (order.items || []).map((item) => ({
    title: item.title,
    qty: item.qty
  }));
  const status = order.status || 'pending';
  const statusText = STATUS_LABELS[status as OrderStatus] || status;

  return {
    id: order.id || '',
    status,
    statusText,
    total,
    items,
    createdAt: formatDateTime(order.createdAt)
  };
}

Page({
  data: {
    loading: false,
    page: 1,
    size: PAGE_SIZE,
    total: 0,
    hasMore: true,
    orders: [],
    displayOrders: []
  },
  async onShow() {
    await this.refresh();
  },
  async onPullDownRefresh() {
    await this.refresh();
    wx.stopPullDownRefresh();
  },
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    await this.loadOrders({ page: this.data.page, size: this.data.size });
  },
  async refresh() {
    this.setData({ page: 1, hasMore: true, orders: [], displayOrders: [] });
    await this.loadOrders({ page: 1, size: this.data.size }, true);
  },
  async loadOrders(params: MyOrdersParams, reset = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const currentPage = params.page ?? 1;
      const response = await myOrders({
        page: currentPage,
        size: params.size ?? this.data.size,
        status: params.status
      });
      const fetched = response?.items || [];
      const total = typeof response?.total === 'number' ? response.total : fetched.length;
      const orders = reset ? fetched : this.data.orders.concat(fetched);
      const hasMore = orders.length < total;
      this.setData({
        loading: false,
        orders,
        displayOrders: orders.map(buildOrderCard),
        total,
        hasMore,
        page: hasMore ? currentPage + 1 : currentPage
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '订单加载失败', icon: 'none' });
    }
  }
});
