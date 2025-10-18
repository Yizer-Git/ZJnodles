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
function formatDate(input) {
    const year = input.getFullYear();
    const month = `${input.getMonth() + 1}`.padStart(2, '0');
    const day = `${input.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
const initialData = {
    loading: true,
    currentDate: formatDate(new Date()),
    sessions: [],
    notices: [],
    certificateUrl: null,
    showCertificateToast: false
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
                const [sessionRes, noticeRes] = yield Promise.all([
                    (0, api_1.listStudySessions)({ date: this.data.currentDate }),
                    (0, api_1.listStudyNotices)()
                ]);
                this.setData({
                    sessions: sessionRes.items || [],
                    notices: noticeRes.items || []
                });
            }
            catch (error) {
                wx.showToast({ title: '研学日程获取失败', icon: 'none' });
            }
            finally {
                this.setData({ loading: false });
            }
        });
    },
    handleDateChange(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentDate = event.detail.value;
            this.setData({ currentDate });
            yield this.bootstrap();
        });
    },
    bookSession(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = event.currentTarget.dataset;
            if (!id)
                return;
            try {
                yield (0, api_1.createStudyBooking)({ sessionId: id });
                wx.showToast({ title: '预约成功，等待审核', icon: 'success' });
            }
            catch (error) {
                wx.showToast({ title: '预约失败', icon: 'none' });
            }
        });
    },
    handleCheckIn(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = event.currentTarget.dataset;
            if (!id)
                return;
            try {
                const result = yield (0, api_1.checkInStudySession)({ sessionId: id });
                this.setData({
                    certificateUrl: result.certificateUrl || null,
                    showCertificateToast: true
                });
                wx.showToast({ title: '签到成功，证书已发送', icon: 'success' });
            }
            catch (error) {
                wx.showToast({ title: '签到失败', icon: 'none' });
            }
        });
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
