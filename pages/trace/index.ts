import { getTrace, createTraceFeedback, type TraceBatch } from '../../services/api';

interface TracePageData {
  code: string;
  loading: boolean;
  batch: TraceBatch | null;
  showFeedback: boolean;
  feedback: {
    message: string;
    contact: string;
  };
}

const initialData: TracePageData = {
  code: '',
  loading: false,
  batch: null,
  showFeedback: false,
  feedback: {
    message: '',
    contact: ''
  }
};

Page({
  data: { ...initialData },
  onInput(event: WechatMiniprogram.Input) {
    this.setData({ code: event.detail.value });
  },
  async handleScan() {
    try {
      const result = await wx.scanCode({});
      const code = result.result || '';
      this.setData({ code });
      await this.search();
    } catch (error) {
      wx.showToast({ title: '扫码取消', icon: 'none' });
    }
  },
  async search() {
    if (!this.data.code) {
      wx.showToast({ title: '请输入或扫码批次码', icon: 'none' });
      return;
    }
    this.setData({ loading: true, batch: null });
    try {
      const data = await getTrace(this.data.code);
      this.setData({ batch: data });
    } catch (error) {
      wx.showToast({ title: '未找到溯源信息', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  openFeedback() {
    this.setData({ showFeedback: true });
  },
  closeFeedback() {
    this.setData({ showFeedback: false });
  },
  handleFeedbackInput(event: WechatMiniprogram.Input) {
    const { field } = event.currentTarget.dataset as { field: 'message' | 'contact' | undefined };
    if (!field) return;
    this.setData({ feedback: { ...this.data.feedback, [field]: event.detail.value } });
  },
  async submitFeedback() {
    if (!this.data.batch) {
      wx.showToast({ title: '请先查询批次', icon: 'none' });
      return;
    }
    if (!this.data.feedback.message) {
      wx.showToast({ title: '请填写异常描述', icon: 'none' });
      return;
    }
    try {
      await createTraceFeedback(this.data.batch.batchCode || this.data.code, {
        message: this.data.feedback.message,
        contact: this.data.feedback.contact
      });
      wx.showToast({ title: '反馈已提交', icon: 'success' });
      this.setData({
        showFeedback: false,
        feedback: { message: '', contact: '' }
      });
    } catch (error) {
      wx.showToast({ title: '反馈失败', icon: 'none' });
    }
  }
});
