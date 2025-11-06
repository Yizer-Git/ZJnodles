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
const SAMPLE_BATCHES = [
    {
        batchCode: 'ZX-20241012-A1',
        productName: '晾晒原味挂面 · 秋收批次',
        origin: '四川中江 · 凯江镇稻麦合作社',
        harvestDate: '2024-10-08 清晨日晒',
        chainTimestamp: '2024-10-12 09:18',
        statusLabel: '链上批次可追溯',
        qualitySummary: '13 项农残检测全部合格，面体蛋白保持在 13.6%。',
        highlights: ['通过 SGS 农残检测', '传统晾晒 48 小时', '冷链入仓温控 6℃'],
        chainRecords: [
            {
                step: '基地采收',
                detail: '麦穗完成露水晾干后采收入仓',
                time: '10-08 05:45',
                operator: '凯江镇稻麦合作社'
            },
            {
                step: '面体加工',
                detail: '古法手工和面，低温醒面 3 次',
                time: '10-09 11:20',
                operator: '中江挂面智造中心'
            },
            {
                step: '质检报告',
                detail: '蛋白、筋力、菌落总数均符合企业标准',
                time: '10-10 16:30',
                operator: '省农科院食品所'
            },
            {
                step: '链上登记',
                detail: '批次摘要写入川链联盟节点',
                time: '10-12 09:18',
                operator: '川链联盟 · 德阳节点'
            }
        ]
    },
    {
        batchCode: 'ZX-20240926-B3',
        productName: '青花椒风味拌面 · 研学体验款',
        origin: '四川青川 · 有机香椒小农',
        harvestDate: '2024-09-20 雾森采摘',
        chainTimestamp: '2024-09-26 14:42',
        statusLabel: '研学体验批次',
        qualitySummary: '香椒精油含量 1.8%，体验课学员评分 4.9/5。',
        highlights: ['体验课程专供', '麻香油冷压锁味', '异物金检双通道'],
        chainRecords: [
            {
                step: '原料验收',
                detail: '青花椒挥发油含量检测合格',
                time: '09-21 08:20',
                operator: '川菜原料中心'
            },
            {
                step: '研学和面',
                detail: '20 位学员完成手工拉面体验',
                time: '09-23 10:00',
                operator: '中江挂面研学营'
            },
            {
                step: '安全检测',
                detail: '金属探测 + 异物 X 光复检',
                time: '09-24 17:15',
                operator: '德阳食品安全实验室'
            },
            {
                step: '链上登记',
                detail: '记录学员活动影像指纹、批次摘要',
                time: '09-26 14:42',
                operator: '川链联盟 · 成都节点'
            }
        ]
    }
];
const initialData = {
    code: '',
    loading: false,
    batch: null,
    showFeedback: false,
    feedback: {
        message: '',
        contact: ''
    },
    sampleBatches: SAMPLE_BATCHES
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
