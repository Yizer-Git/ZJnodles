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
const initialData = {
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
    data: Object.assign({}, initialData),
    onInput(event) {
        this.setData({ code: event.detail.value });
    },
    handleScan() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield wx.scanCode({});
                const code = result.result || '';
                this.setData({ code });
                yield this.search();
            }
            catch (error) {
                wx.showToast({ title: '扫码取消', icon: 'none' });
            }
        });
    },
    search() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data.code) {
                wx.showToast({ title: '请输入或扫码批次码', icon: 'none' });
                return;
            }
            this.setData({ loading: true, batch: null });
            try {
                const data = yield (0, api_1.getTrace)(this.data.code);
                this.setData({ batch: data });
            }
            catch (error) {
                wx.showToast({ title: '未找到溯源信息', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    openFeedback() {
        this.setData({ showFeedback: true });
    },
    closeFeedback() {
        this.setData({ showFeedback: false });
    },
    handleFeedbackInput(event) {
        const { field } = event.currentTarget.dataset;
        if (!field)
            return;
        this.setData({ feedback: Object.assign(Object.assign({}, this.data.feedback), { [field]: event.detail.value }) });
    },
    submitFeedback() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data.batch) {
                wx.showToast({ title: '请先查询批次', icon: 'none' });
                return;
            }
            if (!this.data.feedback.message) {
                wx.showToast({ title: '请填写异常描述', icon: 'none' });
                return;
            }
            try {
                yield (0, api_1.createTraceFeedback)(this.data.batch.batchCode || this.data.code, {
                    message: this.data.feedback.message,
                    contact: this.data.feedback.contact
                });
                wx.showToast({ title: '反馈已提交', icon: 'success' });
                this.setData({
                    showFeedback: false,
                    feedback: { message: '', contact: '' }
                });
            }
            catch (error) {
                wx.showToast({ title: '反馈失败', icon: 'none' });
            }
        });
    }
});
