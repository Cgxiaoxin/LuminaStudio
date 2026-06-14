import Taro from '@tarojs/taro';

export const apiBaseUrl = 'http://localhost:3000/api';

export function request<T = any>(url: string, options?: Taro.request.Option): Promise<T> {
  const token = Taro.getStorageSync('token');
  const tenantId = Taro.getStorageSync('tenantId');

  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${apiBaseUrl}${url}`,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
      },
      ...options,
      success: (res) => {
        if (res.statusCode === 401) {
          Taro.removeStorageSync('token');
          Taro.removeStorageSync('tenantId');
          Taro.reLaunch({ url: '/pages/login/index' });
          return;
        }
        resolve(res.data as T);
      },
      fail: (err) => reject(err),
    });
  });
}
