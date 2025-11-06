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
function buildFallbackSessions(date) {
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
const fallbackNotices = [
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
                const sessions = (sessionRes === null || sessionRes === void 0 ? void 0 : sessionRes.items) && sessionRes.items.length
                    ? sessionRes.items
                    : buildFallbackSessions(this.data.currentDate);
                const notices = (noticeRes === null || noticeRes === void 0 ? void 0 : noticeRes.items) && noticeRes.items.length
                    ? noticeRes.items
                    : fallbackNotices;
                this.setData({
                    sessions,
                    notices
                });
            }
            catch (error) {
                wx.showToast({ title: '研学日程获取失败', icon: 'none' });
                this.setData({
                    sessions: buildFallbackSessions(this.data.currentDate),
                    notices: fallbackNotices
                });
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
