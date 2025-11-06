interface SettingsData {
  notificationEnabled: boolean;
  campaignEnabled: boolean;
  locationEnabled: boolean;
}

const INITIAL_STATE: SettingsData = {
  notificationEnabled: true,
  campaignEnabled: true,
  locationEnabled: false
};

Page({
  data: { ...INITIAL_STATE },
  handleToggleChange(event: WechatMiniprogram.SwitchChange) {
    const { key } = event.currentTarget.dataset as { key?: keyof SettingsData };
    if (!key) {
      return;
    }
    this.setData({ [key]: event.detail.value });
  },
  handleLinkTap(event: WechatMiniprogram.TouchEvent<{ url?: string }>) {
    const { url } = event.currentTarget.dataset;
    if (!url) {
      wx.showToast({ title: '敬请期待', icon: 'none' });
      return;
    }
    wx.navigateTo({ url });
  },
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后将清空本地登录状态，是否继续？',
      cancelText: '取消',
      confirmText: '退出登录',
      confirmColor: '#00BCD4',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.showToast({ title: '已退出登录', icon: 'none' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/index' });
          }, 600);
        }
      }
    });
  }
});
