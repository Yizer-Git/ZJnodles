const { backgroundAssets } = require('../../utils/backgrounds');
Page({
  data: {
    account: '',
    password: '',
    backgrounds: backgroundAssets
  },
  handleAccountInput(event) {
    this.setData({ account: event.detail.value });
  },
  handlePasswordInput(event) {
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
  },
  handleSocialLogin(event) {
    const { provider } = event.currentTarget.dataset || {};
    const labelMap = { wechat: '微信', qq: 'QQ' };
    const providerLabel = labelMap[provider] || '社交';
    wx.showToast({ title: `${providerLabel}登录即将上线`, icon: 'none' });
  }
});
