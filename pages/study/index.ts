import {
  listStudySessions,
  listStudyNotices,
  createStudyBooking,
  checkInStudySession,
  type StudySession,
  type StudyNotice
} from '../../services/api';

interface StudyPageData {
  loading: boolean;
  currentDate: string;
  sessions: StudySession[];
  notices: StudyNotice[];
  certificateUrl: string | null;
  showCertificateToast: boolean;
}

function formatDate(input: Date) {
  const year = input.getFullYear();
  const month = `${input.getMonth() + 1}`.padStart(2, '0');
  const day = `${input.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialData: StudyPageData = {
  loading: true,
  currentDate: formatDate(new Date()),
  sessions: [],
  notices: [],
  certificateUrl: null,
  showCertificateToast: false
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
      const [sessionRes, noticeRes] = await Promise.all([
        listStudySessions({ date: this.data.currentDate }),
        listStudyNotices()
      ]);
      this.setData({
        sessions: sessionRes.items || [],
        notices: noticeRes.items || []
      });
    } catch (error) {
      wx.showToast({ title: '研学日程获取失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async handleDateChange(event: WechatMiniprogram.PickerChange) {
    const currentDate = event.detail.value;
    this.setData({ currentDate });
    await this.bootstrap();
  },
  async bookSession(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    if (!id) return;
    try {
      await createStudyBooking({ sessionId: id });
      wx.showToast({ title: '预约成功，等待审核', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '预约失败', icon: 'none' });
    }
  },
  async handleCheckIn(event: WechatMiniprogram.TouchEvent<{ id: string }>) {
    const { id } = event.currentTarget.dataset;
    if (!id) return;
    try {
      const result = await checkInStudySession({ sessionId: id });
      this.setData({
        certificateUrl: result.certificateUrl || null,
        showCertificateToast: true
      });
      wx.showToast({ title: '签到成功，证书已发送', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '签到失败', icon: 'none' });
    }
  },
  downloadCertificate() {
    if (!this.data.certificateUrl) {
      wx.showToast({ title: '暂无电子证书', icon: 'none' });
      return;
    }
    wx.downloadFile({
      url: this.data.certificateUrl,
      success() {
        wx.showToast({ title: '证书下载成功', icon: 'success' });
      },
      fail() {
        wx.showToast({ title: '证书下载失败', icon: 'none' });
      }
    });
  },
  closeCertificateToast() {
    this.setData({ showCertificateToast: false });
  }
});
