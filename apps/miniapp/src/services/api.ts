import Taro from '@tarojs/taro';
import { apiBaseUrl } from './config';
import { t } from '../i18n/messages';

const DEFAULT_TENANT_ID = '1';

export function ensureGuestContext() {
  if (!Taro.getStorageSync('tenantId')) {
    Taro.setStorageSync('tenantId', DEFAULT_TENANT_ID);
  }
}

export function formatRequestError(err: unknown): string {
  const errMsg =
    (err as { errMsg?: string })?.errMsg ||
    (err as { message?: string })?.message ||
    '';

  if (errMsg.includes('url not in domain list')) {
    return t('errors.domainNotAllowed');
  }
  if (errMsg.includes('CONNECTION_REFUSED') || errMsg.includes('errcode:-102') || errMsg.includes('-102')) {
    return '无法连接服务器：真机调试请将 API 地址改为电脑局域网 IP（见 .env.development.local）';
  }
  return errMsg || t('common.failed');
}

export function request<T = any>(url: string, options?: Taro.request.Option & { auth?: boolean }): Promise<T> {
  ensureGuestContext();
  const token = Taro.getStorageSync('token');
  const tenantId = Taro.getStorageSync('tenantId') || DEFAULT_TENANT_ID;
  const requireAuth = options?.auth !== false && !token && isProtectedPath(url, options?.method);

  if (requireAuth) {
    return Promise.reject(new Error(t('errors.loginRequired')));
  }

  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${apiBaseUrl}${url}`,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Tenant-Id': tenantId,
      },
      ...options,
      success: (res) => {
        if (res.statusCode === 401) {
          const hadToken = !!token;
          Taro.removeStorageSync('token');
          if (hadToken) {
            Taro.reLaunch({ url: '/pages/login/index' });
          }
          reject(new Error(t('errors.unauthorized')));
          return;
        }
        if (res.statusCode >= 400) {
          const msg = (res.data as { message?: string })?.message || t('common.failed');
          reject(new Error(msg));
          return;
        }
        resolve(res.data as T);
      },
      fail: (err) => reject(new Error(formatRequestError(err))),
    });
  });
}

function isProtectedPath(url: string, method?: string) {
  const pathOnly = url.split('?')[0];
  const upperMethod = (method || 'GET').toUpperCase();

  const publicRoutes: Array<{ methods: string[]; pattern: RegExp }> = [
    { methods: ['POST'], pattern: /^\/auth\/(weapp-login|admin-login)$/ },
    { methods: ['GET'], pattern: /^\/auth\/(agreement|wechat-config)$/ },
  ];

  if (publicRoutes.some((r) => r.methods.includes(upperMethod) && r.pattern.test(pathOnly))) {
    return false;
  }

  if (upperMethod === 'GET' || upperMethod === 'HEAD') {
    return /^\/(bookings|memberships|orders|marketing\/my-coupons|auth\/(me|me\/stats))/.test(pathOnly);
  }
  return true;
}
