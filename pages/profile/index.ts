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
  icon?: string;
}

interface ProfileBadge {
  id: string;
  label: string;
  value: string;
  accent?: boolean;
}

interface ProfilePageData {
  loading: boolean;
  user: WechatMiniprogram.UserInfo | Record<string, unknown> | null;
  avatarUrl: string;
  member: MemberProfile | null;
  ops: OpsDashboard | null;
  coreServices: ServiceEntry[];
  moreServices: ServiceEntry[];
  badges: ProfileBadge[];
  growthPercent: number;
  growthRemaining: number;
  nextLevel: number;
  displayName: string;
  memberTierLabel: string;
  memberSummary: string;
  vipSubtitle: string;
  vipActionLabel: string;
  memberPointsDisplay: string;
  memberGrowthDisplay: string;
  memberCouponCount: number;
  memberCaption: string;
}

const DEFAULT_AVATAR = '/assets/avatar-placeholder.jpg';

const FALLBACK_USER: WechatMiniprogram.UserInfo = {
  nickName: '秋收面友',
  avatarUrl: DEFAULT_AVATAR,
  gender: 0,
  country: 'CN',
  province: '四川',
  city: '德阳',
  language: 'zh_CN'
};

const FALLBACK_MEMBER: MemberProfile = {
  id: 'demo-member',
  level: 4,
  levelName: '甄选金桂会员',
  points: 2680,
  growthValue: 540,
  couponCount: 4
};

const FALLBACK_OPS: OpsDashboard = {
  operations: { onlineSlots: 6 },
  moderation: { pending: 2 },
  alerts: { today: 0 },
  pendingTasks: 3
};

const BASE_ENTRIES: ServiceEntry[] = [
  {
    id: 'orders',
    title: '我的订单',
    description: '支付、物流进度、售后',
    path: '/pages/orders/index',
    icon: '/assets/images/icons/classic-chinese/entry-cabinet.svg'
  },
  {
    id: 'trace',
    title: '区块链溯源',
    description: '扫码查看批次与质检报告',
    path: '/pages/trace/index',
    icon: '/assets/images/icons/classic-chinese/hanging-rack.svg'
  },
  {
    id: 'study',
    title: '文旅研学',
    description: '预约行程、签到领取证书',
    path: '/pages/study/index',
    icon: '/assets/images/icons/classic-chinese/tea-desk.svg'
  },
  {
    id: 'enterprise',
    title: '企业服务',
    description: '企业注册、合同签署与发票',
    path: '/pages/enterprise/index',
    icon: '/assets/images/icons/classic-chinese/screen.svg'
  },
  {
    id: 'ops',
    title: '运营后台',
    description: 'CMS/OMS配置与风控审计',
    path: '/pages/ops/index',
    roles: ['operator', 'admin'],
    icon: '/assets/images/icons/classic-chinese/display-shelf.svg'
  }
];

const TOOL_ENTRIES: ServiceEntry[] = [
  {
    id: 'favorites',
    title: '我的收藏',
    description: '收藏的活动与商品',
    path: ''
  },
  {
    id: 'coupon',
    title: '兑换码',
    description: '输入兑换码获取福利',
    path: ''
  },
  {
    id: 'address',
    title: '地址管理',
    description: '收货地址快速维护',
    path: ''
  },
  {
    id: 'support',
    title: '客户支持',
    description: '常见问题与在线客服',
    path: ''
  }
];

const initialData: ProfilePageData = {
  loading: true,
  user: null,
  avatarUrl: DEFAULT_AVATAR,
  member: null,
  ops: null,
  coreServices: [],
  moreServices: [],
  badges: [],
  growthPercent: 0,
  growthRemaining: 100,
  nextLevel: 1,
  displayName: '秋收面友',
  memberTierLabel: 'LV04 甄选金桂会员',
  memberSummary: '2680 积分 · 成长值 540',
  vipSubtitle: '已开启甄选金桂会员，尊享 30+ 权益',
  vipActionLabel: '权益总览',
  memberPointsDisplay: '2680',
  memberGrowthDisplay: '540',
  memberCouponCount: 4,
  memberCaption: '专属券 4 张待使用'
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
      const resolvedUser = user ?? FALLBACK_USER;
      const resolvedOps = ops ?? FALLBACK_OPS;
      const memberBase = member
        ? {
            ...member,
            level: Math.max(member.level ?? 0, FALLBACK_MEMBER.level ?? 0),
            levelName: member.levelName?.trim().length
              ? member.levelName
              : FALLBACK_MEMBER.levelName,
            points: Math.max(member.points ?? 0, FALLBACK_MEMBER.points ?? 0),
            growthValue: Math.max(member.growthValue ?? 0, FALLBACK_MEMBER.growthValue ?? 0),
            couponCount: Math.max(member.couponCount ?? 0, FALLBACK_MEMBER.couponCount ?? 0)
          }
        : FALLBACK_MEMBER;
      const tierLevel = memberBase.level ?? FALLBACK_MEMBER.level ?? 1;
      const tierName = memberBase.levelName || FALLBACK_MEMBER.levelName || '甄选会员';
      const points = memberBase.points ?? FALLBACK_MEMBER.points ?? 0;
      const growthValue = memberBase.growthValue ?? FALLBACK_MEMBER.growthValue ?? 0;
      const couponCount = memberBase.couponCount ?? FALLBACK_MEMBER.couponCount ?? 0;
      const roles = (resolvedUser && 'roles' in (resolvedUser as Record<string, unknown>))
        ? ((resolvedUser as Record<string, unknown>).roles as string[])
        : [];
      const filterByRole = (entry: ServiceEntry) => {
        if (!entry.roles) return true;
        return roles?.some((role) => entry.roles!.includes(String(role)));
      };
      const availableServices = BASE_ENTRIES.filter(filterByRole);
      const coreServices = availableServices.slice(0, 5);
      const extraServices = availableServices.slice(5);
      const toolServices = TOOL_ENTRIES.filter(filterByRole);
      const moreServices = [...extraServices, ...toolServices];
      const growthModulo = growthValue % 100;
      const growthPercent =
        growthValue === 0 ? 0 : growthModulo === 0 ? 100 : growthModulo;
      const growthRemaining =
        growthValue === 0 ? 100 : growthModulo === 0 ? 0 : 100 - growthModulo;
      const nextLevel = tierLevel + 1;
      const memberTierLabel = `LV${String(tierLevel).padStart(2, '0')} ${tierName}`;
      const memberSummary = `${points} 积分 · 成长值 ${growthValue}`;
      const memberPointsDisplay = `${points}`;
      const memberGrowthDisplay = `${growthValue}`;
      const memberCouponCount = couponCount;
      const memberCaption = memberCouponCount
        ? `专属券 ${memberCouponCount} 张待使用`
        : '欢迎开启甄选旅程';
      const vipSubtitle = `已开启${tierName}，尊享 30+ 权益`;
      const vipActionLabel = '权益总览';
      const userRecord =
        resolvedUser && typeof resolvedUser === 'object'
          ? (resolvedUser as Record<string, unknown>)
          : null;
      const badges: ProfileBadge[] = [
        {
          id: 'level',
          label: '会员等级',
          value: memberTierLabel,
          accent: true
        },
        {
          id: 'points',
          label: '积分累计',
          value: `${points}`
        },
        {
          id: 'growth',
          label: '成长值',
          value: `${growthValue}`
        },
        {
          id: 'coupon',
          label: '专属券',
          value: `${memberCouponCount} 张`
        }
      ];
      const memberRecord =
        memberBase && typeof memberBase === 'object'
          ? (memberBase as Record<string, unknown>)
          : null;
      const avatarSources = [
        userRecord && typeof userRecord.avatarUrl === 'string' ? userRecord.avatarUrl : '',
        userRecord && typeof userRecord.avatar === 'string' ? userRecord.avatar : '',
        memberRecord && typeof memberRecord.avatarUrl === 'string' ? memberRecord.avatarUrl : '',
        memberRecord && typeof memberRecord.avatar === 'string' ? memberRecord.avatar : ''
      ];
      const resolvedAvatar = avatarSources.find((value) => typeof value === 'string' && value.trim().length) || '';
      const displayName =
        (userRecord && typeof userRecord.nickName === 'string' && userRecord.nickName.trim().length
          ? (userRecord.nickName as string)
          : FALLBACK_USER.nickName) || '甄选会员';
      this.setData({
        user: resolvedUser,
        avatarUrl: resolvedAvatar || DEFAULT_AVATAR,
        member: memberBase,
        ops: resolvedOps,
        coreServices,
        moreServices,
        badges,
        growthPercent,
        growthRemaining,
        nextLevel,
        displayName,
        memberTierLabel,
        memberSummary,
        vipSubtitle,
        vipActionLabel,
        memberPointsDisplay,
        memberGrowthDisplay,
        memberCouponCount,
        memberCaption
      });
    } catch (error) {
      wx.showToast({ title: '用户信息加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  handleEntryTap(event: WechatMiniprogram.TouchEvent<{ path: string; tab?: boolean }>) {
    const { path, tab } = event.currentTarget.dataset;
    if (!path) {
      wx.showToast({ title: '即将开放，敬请期待', icon: 'none' });
      return;
    }
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
  },
  handleVipAction() {
    const { memberTierLabel, memberSummary } = this.data;
    const summary = `${memberTierLabel}\n${memberSummary}`;
    wx.showModal({
      title: '甄选会员权益',
      content: `当前身份：${summary}\n尊享研学优先预约、甄选好礼积分兑付等 30+ 权益。`,
      confirmText: '联系顾问',
      success: (res) => {
        if (res.confirm) {
          this.handleContactOps();
        }
      }
    });
  },
  handleSettingsTap() {
    wx.navigateTo({
      url: '/pages/settings/index',
      fail: () => {
        wx.showToast({ title: '设置页面暂不可用', icon: 'none' });
      }
    });
  }
});
