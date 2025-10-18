import {
  getOpsDashboard,
  listOpsTasks,
  listOpsLogs,
  updateOpsTaskStatus,
  toggleOperationSlot,
  syncInventorySnapshot,
  type OpsDashboard,
  type OpsTask,
  type OpsLog
} from '../../services/api';

interface OpsPageData {
  loading: boolean;
  dashboard: OpsDashboard | null;
  tasks: OpsTask[];
  logs: OpsLog[];
}

const initialData: OpsPageData = {
  loading: true,
  dashboard: null,
  tasks: [],
  logs: []
};

Page({
  data: { ...initialData },
  async onLoad() {
    await this.bootstrap();
  },
  async onPullDownRefresh() {
    await this.bootstrap();
    wx.stopPullDownRefresh();
  },
  async bootstrap() {
    this.setData({ loading: true });
    try {
      const [dashboard, tasks, logs] = await Promise.all([
        getOpsDashboard(),
        listOpsTasks(),
        listOpsLogs()
      ]);
      this.setData({
        dashboard,
        tasks: tasks.items || [],
        logs: logs.items || []
      });
    } catch (error) {
      wx.showToast({ title: '运营数据加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
  async handleTaskAction(event: WechatMiniprogram.TouchEvent<{ id: string; action: 'approve' | 'reject' | 'done' }>) {
    const { id, action } = event.currentTarget.dataset;
    if (!id) return;
    try {
      await updateOpsTaskStatus({ id, action });
      wx.showToast({ title: '操作成功', icon: 'success' });
      await this.bootstrap();
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },
  async handleToggleSlot(event: WechatMiniprogram.TouchEvent<{ slotId: string; enable: boolean }>) {
    const { slotId, enable } = event.currentTarget.dataset;
    if (!slotId) return;
    try {
      await toggleOperationSlot({ slotId, enable });
      wx.showToast({ title: enable ? '已上线' : '已下线', icon: 'success' });
      await this.bootstrap();
    } catch (error) {
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },
  async handleSyncInventory() {
    try {
      await syncInventorySnapshot();
      wx.showToast({ title: '库存同步成功', icon: 'success' });
      await this.bootstrap();
    } catch (error) {
      wx.showToast({ title: '同步失败', icon: 'none' });
    }
  }
});
