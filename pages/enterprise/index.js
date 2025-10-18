"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../services/api");
const DEFAULT_FORM = {
    companyName: '',
    contact: '',
    contactPhone: '',
    demand: '',
    budget: ''
};
const initialData = {
    loading: true,
    submitting: false,
    profile: null,
    requirements: [],
    contracts: [],
    invoices: [],
    form: Object.assign({}, DEFAULT_FORM)
};
Page({
    data: Object.assign({}, initialData),
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bootstrap();
        });
    },
    onPullDownRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bootstrap();
            wx.stopPullDownRefresh();
        });
    },
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setData({ loading: true });
            try {
                const [profile, requirements, contracts, invoices] = yield Promise.all([
                    (0, api_1.getEnterpriseProfile)(),
                    (0, api_1.listEnterpriseRequirements)(),
                    (0, api_1.listEnterpriseContracts)(),
                    (0, api_1.listEnterpriseInvoices)()
                ]);
                this.setData({
                    profile,
                    requirements: requirements.items || [],
                    contracts: contracts.items || [],
                    invoices: invoices.items || []
                });
            }
            catch (error) {
                wx.showToast({ title: '企业数据加载失败', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    handleInput(event) {
        const dataset = event.currentTarget.dataset;
        const field = dataset.field;
        if (!field)
            return;
        const value = event.detail.value;
        this.setData({ form: Object.assign(Object.assign({}, this.data.form), { [field]: value }) });
    },
    submitRequirement() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data.submitting)
                return;
            const { companyName, contact, contactPhone, demand } = this.data.form;
            if (!companyName || !contact || !contactPhone || !demand) {
                wx.showToast({ title: '请完善需求信息', icon: 'none' });
                return;
            }
            this.setData({ submitting: true });
            try {
                yield (0, api_1.createEnterpriseRequirement)({
                    companyName,
                    contact,
                    contactPhone,
                    demand,
                    budget: this.data.form.budget
                });
                wx.showToast({ title: '需求提交成功', icon: 'success' });
                this.setData({ form: Object.assign({}, DEFAULT_FORM) });
                yield this.bootstrap();
            }
            catch (error) {
                wx.showToast({ title: '提交失败', icon: 'none' });
            }
            finally {
                this.setData({ submitting: false });
            }
        });
    },
    previewContract(event) {
        const { url } = event.currentTarget.dataset;
        if (!url)
            return;
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
    downloadInvoice(event) {
        const { url } = event.currentTarget.dataset;
        if (!url)
            return;
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
