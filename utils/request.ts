export interface ReqOptions<T> {
  url: string;
  method?: WechatMiniprogram.RequestOption['method'] | 'PATCH';
  data?: T;
  auth?: boolean;
}

function resolveBaseUrl(): string {
  const stored = wx.getStorageSync('apiBaseUrl');
  if (stored) return stored;

  try {
    const app = getApp<{ config?: { apiBaseUrl?: string }, globalData?: { apiBaseUrl?: string } }>();
    if (app && app.config && app.config.apiBaseUrl) return app.config.apiBaseUrl;
    if (app && app.globalData && app.globalData.apiBaseUrl) return app.globalData.apiBaseUrl;
  } catch (_) {
    // getApp might not be available during initial bootstrap; swallow error.
  }

  return '';
}

function buildUrl(path: string): string | null {
  if (/^https?:\/\//.test(path)) return path;
  const base = resolveBaseUrl();
  if (!base) return null;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
}

export function getToken(): string | null {
  return wx.getStorageSync('token') || null;
}

export function setToken(token: string) {
  wx.setStorageSync('token', token);
}

export function request<TReq=any, TRes=any>(opts: ReqOptions<TReq>) {
  return new Promise<TRes>((resolve, reject) => {
    const targetUrl = buildUrl(opts.url);
    if (!targetUrl) {
      console.warn('[request] missing apiBaseUrl, aborting request:', opts.url);
      reject({ code: 'NO_BASE_URL', message: 'API base url is not configured' });
      return;
    }
    wx.request({
      url: targetUrl,
      method: (opts.method || 'GET') as unknown as WechatMiniprogram.RequestOption['method'],
      data: opts.data,
      header: {
        'Content-Type': 'application/json',
        ...(opts.auth && getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
      },
      success: (res) => {
        if (res.statusCode! >= 200 && res.statusCode! < 300) resolve(res.data as TRes);
        else reject({ code: res.statusCode, data: res.data });
      },
      fail: reject
    })
  });
}
