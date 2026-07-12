import { api, apiBaseUrl } from './api';

/** 将 /api/uploads/... 或外链转为可展示的完整 URL */
export function resolveAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const origin = apiBaseUrl.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  const res = await fetch(`${apiBaseUrl}/upload/image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
    },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Upload failed');
  }
  return data.url as string;
}

export async function fetchTenantBranding(tenantId: string) {
  const res = await api.get(`/tenants/${tenantId}`);
  return res.data as { brandName?: string; logoUrl?: string; name?: string };
}
