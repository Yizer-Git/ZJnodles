import {
  getCurrentUser,
  getMemberProfile,
  getOpsDashboard,
  type MemberProfile,
  type OpsDashboard
} from '../../services/api';

interface ServiceEntry {
  id: string;
  title: string;
  description: string;
  path: string;
  tab?: boolean;
  roles?: string[];
}

interface ProfilePageData {
  loading: boolean;
  user: WechatMiniprogram.UserInfo | Record<string, unknown> | null;
  member: MemberProfile | null;
  ops: OpsDashboard | null;
  entries: ServiceEntry[];
}

const BASE_ENTRIES: ServiceEntry[] = [
  {
    id: 'orders',
    title: '我的订单',
    description: '支付、物流进度、售后',
    path: '/pages/orders/index'
  },
  {
    id: 'trace',
    title: '区块链溯源',
    description: '扫码查看批次与质检报告',
    path: '/pages/trace/index'
  },
  {
    id: 'study',
    title: '文旅研学',
    description: '预约行程、签到领取证书',
    path: '/pages/study/index'
  },
  {
    id: 'enterprise',
    title: '企业服务',
    description: '企业注册、合同签署与发票',
    path: '/pages/enterprise/index'
  },
  {
    id: 'ops',
    title: '运营后台',
    description: 'CMS/OMS配置与风控审计',
    path: '/pages/ops/index',
    roles: ['operator', 'admin']
  }
];

const initialData: ProfilePageData = {
  loading: true,
  user: null,
  member: null,
  ops: null,
  entries: BASE_ENTRIES
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
      const [user, member, ops] = await Promise.all([
        getCurrentUser().catch(() => null),
        getMemberProfile().catch(() => null),
        getOpsDashboard().catch(() => null)
      ]);
      const roles = (user && 'roles' in (user as Record<string, unknown>)) ? ((user as Record<string, unknown>).roles as string[]) : [];
      this.setData({
        user,
        member,
        ops,
        entries: BASE_ENTRIES.filter((entry) => {
          if (!entry.roles) return true;
          return roles?.some((role) => entry.roles!.includes(String(role)));
        })
      });
    } catch (error) {
      wx.showToast({ title: '用户信息加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  handleEntryTap(event: WechatMiniprogram.TouchEvent<{ path: string; tab?: boolean }>) {
    const { path, tab } = event.currentTarget.dataset;
    if (!path) return;
    if (tab) {
      wx.switchTab({ url: path });
      return;
    }
    wx.navigateTo({ url: path });
  },
  handleContactOps() {
    wx.showModal({
      title: '客服与对接',
      content: '请通过客服电话 400-123-1987 或企业微信联系运营团队.',
      showCancel: false
    });
  }
});
