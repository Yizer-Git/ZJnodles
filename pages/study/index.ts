// 只保留静态数据，不需要后端 API
type StudySession = {
  id: string;
  title: string;
  description: string;
  startTimeText: string;
  endTimeText: string;
  location: string;
  remaining: number;
  statusLabel: string;
};

type StudyNotice = {
  id: string;
  title: string;
  content: string;
  publishTimeText: string;
};

interface StudyPageData {
  loading: boolean;
  currentDate: string;
  sessions: StudySession[];
  notices: StudyNotice[];
  certificateUrl: string | null;
  showCertificateToast: boolean;
}

function buildFallbackSessions(date: string): StudySession[] {
  const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const parsed = new Date(date.replace(/-/g, '/'));
  const weekday = Number.isNaN(parsed.getTime()) ? '' : weekdayLabels[parsed.getDay()];
  const dateNote = weekday ? `${date} · ${weekday}` : date;
  return [
    {
      id: `${date}-check-in`,
      title: '研学营签到与迎宾茶叙',
      description: `队伍报道、领取胸牌，讲解老师介绍今日亮点。${dateNote}首个班次建议提前10分钟抵达。`,
      startTimeText: '08:40',
      endTimeText: '09:10',
      location: '中江非遗馆一层迎宾厅',
      remaining: 18,
      statusLabel: '可预约'
    },
    {
      id: `${date}-craft-lab`,
      title: '古法晾晒工艺实验室',
      description: '观摩传统挂面拉丝环节，体验“麦香三解”互动实验，并由传承人现场答疑。',
      startTimeText: '09:30',
      endTimeText: '11:00',
      location: '工艺研学工坊 B3',
      remaining: 12,
      statusLabel: '余位紧张'
    },
    {
      id: `${date}-field-trip`,
      title: '晒场实地走访与口味研判',
      description: '前往室外日晒区，记录温湿度曲线，完成小组口味盲测，提交数字化研判表。',
      startTimeText: '14:00',
      endTimeText: '16:00',
      location: '活化示范晒场',
      remaining: 9,
      statusLabel: '可预约'
    }
  ];
}

const fallbackNotices: StudyNotice[] = [
  {
    id: 'weather-advice',
    title: '天气提示',
    content: '今日多云有微风，请自备轻薄外套；晒场区域地面易滑，建议穿着防滑鞋。',
    publishTimeText: '今日 07:20 发布'
  },
  {
    id: 'gathering-point',
    title: '集合与联络',
    content: '开营签到地点：迎宾厅南侧服务台。活动当日联系人：罗老师 189****0321。',
    publishTimeText: '今日 07:10 发布'
  }
];

function formatDate(input: Date) {
  const year = input.getFullYear();
  const month = `${input.getMonth() + 1}`.padStart(2, '0');
  const day = `${input.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialData: StudyPageData = {
  loading: false,
  currentDate: formatDate(new Date()),
  // 只用静态示例行程
  sessions: buildFallbackSessions(formatDate(new Date())).slice(0, 2),
  notices: fallbackNotices,
  certificateUrl: null,
  showCertificateToast: false
};

Page({
  data: { ...initialData },
  onLoad() {
    // 页面加载时直接用静态数据，无需异步请求
    this.setData({ ...initialData });
  },
  onPullDownRefresh() {
    // 下拉刷新也只用静态数据
    this.setData({ ...initialData });
    wx.stopPullDownRefresh();
  },
  handleDateChange(event: WechatMiniprogram.PickerChange) {
    // 切换日期时只切换静态数据
    const currentDate = String(event.detail.value);
    this.setData({
      currentDate,
      sessions: buildFallbackSessions(currentDate).slice(0, 2)
    });
  },
  bookSession(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    // 预约按钮仅做前端提示
    wx.showToast({ title: '静态页面，无需预约', icon: 'none' });
  },
  handleCheckIn(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    // 签到按钮仅做前端提示
    wx.showToast({ title: '静态页面，无需签到', icon: 'none' });
  },
  downloadCertificate() {
    wx.showToast({ title: '静态页面，无证书下载', icon: 'none' });
  },
  closeCertificateToast() {
    this.setData({ showCertificateToast: false });
  }
});
