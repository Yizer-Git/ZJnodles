import { backgroundAssets } from '../../utils/backgrounds';

Page({
  data: {
    account: '',
    password: '',
    backgrounds: backgroundAssets
  },
  handleAccountInput(event: WechatMiniprogram.Input) {
    this.setData({ account: event.detail.value });
  },
  handlePasswordInput(event: WechatMiniprogram.Input) {
    this.setData({ password: event.detail.value });
  },
  handleLogin() {
    if (!this.data.account || !this.data.password) {
      wx.showToast({ title: '请输入账号和密码', icon: 'none' });
      return;
    }
    wx.showToast({ title: '登录中', icon: 'loading', duration: 1500 });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/home/index' });
    }, 1500);
  },
  handleRegister() {
    wx.showToast({ title: '注册功能即将上线', icon: 'none' });
  },
  handleGuestLogin() {
    wx.switchTab({ url: '/pages/home/index' });
  },
  handleQuickLink() {
    wx.showToast({ title: '敬请期待', icon: 'none' });
  }
});
