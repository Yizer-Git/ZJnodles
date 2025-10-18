import { createBooking } from '../../services/api';
Page({
  data: { poiId: '', date: '', time: '', pax: 1 },
  onPoi(e:any){ this.setData({ poiId: e.detail.value }); },
  onDate(e:any){ this.setData({ date: e.detail.value }); },
  onTime(e:any){ this.setData({ time: e.detail.value }); },
  onPax(e:any){ this.setData({ pax: Number(e.detail.value) || 1 }); },
  async submit(){
    try{
      await createBooking({ poiId: this.data.poiId, date: this.data.date, time: this.data.time, pax: this.data.pax });
      wx.showToast({ title: '预约成功', icon: 'success' });
    }catch(e){ wx.showToast({ title: '失败，请登录/校验参数', icon: 'none' }); }
  }
});