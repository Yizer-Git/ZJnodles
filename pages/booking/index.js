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
Page({
    data: { poiId: '', date: '', time: '', pax: 1 },
    onPoi(e) { this.setData({ poiId: e.detail.value }); },
    onDate(e) { this.setData({ date: e.detail.value }); },
    onTime(e) { this.setData({ time: e.detail.value }); },
    onPax(e) { this.setData({ pax: Number(e.detail.value) || 1 }); },
    submit() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, api_1.createBooking)({ poiId: this.data.poiId, date: this.data.date, time: this.data.time, pax: this.data.pax });
                wx.showToast({ title: '预约成功', icon: 'success' });
            }
            catch (e) {
                wx.showToast({ title: '失败，请登录/校验参数', icon: 'none' });
            }
        });
    }
});
