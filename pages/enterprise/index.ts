import {
  getEnterpriseProfile,
  listEnterpriseRequirements,
  createEnterpriseRequirement,
  listEnterpriseContracts,
  listEnterpriseInvoices,
  type EnterpriseProfile,
  type EnterpriseRequirement,
  type EnterpriseContract,
  type EnterpriseInvoice
} from '../../services/api';

interface RequirementForm {
  companyName: string;
  contact: string;
  contactPhone: string;
  demand: string;
  budget: string;
}

interface EnterprisePageData {
  loading: boolean;
  submitting: boolean;
  profile: EnterpriseProfile | null;
  requirements: EnterpriseRequirement[];
  contracts: EnterpriseContract[];
  invoices: EnterpriseInvoice[];
  form: RequirementForm;
}

const DEFAULT_FORM: RequirementForm = {
  companyName: '',
  contact: '',
  contactPhone: '',
  demand: '',
  budget: ''
};

const initialData: EnterprisePageData = {
  loading: true,
  submitting: false,
  profile: null,
  requirements: [],
  contracts: [],
  invoices: [],
  form: { ...DEFAULT_FORM }
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
      const [profile, requirements, contracts, invoices] = await Promise.all([
        getEnterpriseProfile(),
        listEnterpriseRequirements(),
        listEnterpriseContracts(),
        listEnterpriseInvoices()
      ]);
      this.setData({
        profile,
        requirements: requirements.items || [],
        contracts: contracts.items || [],
        invoices: invoices.items || []
      });
    } catch (error) {
      wx.showToast({ title: '企业数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  handleInput(event: WechatMiniprogram.Input) {
    const dataset = event.currentTarget.dataset as { field?: keyof RequirementForm };
    const field = dataset.field;
    if (!field) return;
    const value = event.detail.value;
    this.setData({ form: { ...this.data.form, [field]: value } });
  },
  async submitRequirement() {
    if (this.data.submitting) return;
    const { companyName, contact, contactPhone, demand } = this.data.form;
    if (!companyName || !contact || !contactPhone || !demand) {
      wx.showToast({ title: '请完善需求信息', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await createEnterpriseRequirement({
        companyName,
        contact,
        contactPhone,
        demand,
        budget: this.data.form.budget
      });
      wx.showToast({ title: '需求提交成功', icon: 'success' });
      this.setData({ form: { ...DEFAULT_FORM } });
      await this.bootstrap();
    } catch (error) {
      wx.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
  previewContract(event: WechatMiniprogram.TouchEvent<{ url: string }>) {
    const { url } = event.currentTarget.dataset;
    if (!url) return;
    wx.downloadFile({
      url,
      success(res) {
        wx.openDocument({ filePath: res.tempFilePath });
      },
      fail() {
        wx.showToast({ title: '合同预览失败', icon: 'none' });
      }
    });
  },
  downloadInvoice(event: WechatMiniprogram.TouchEvent<{ url: string }>) {
    const { url } = event.currentTarget.dataset;
    if (!url) return;
    wx.downloadFile({
      url,
      success() {
        wx.showToast({ title: '发票已下载', icon: 'success' });
      },
      fail() {
        wx.showToast({ title: '发票下载失败', icon: 'none' });
      }
    });
  }
});
