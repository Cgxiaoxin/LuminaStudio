export function resolveTenantId(req: { user?: { tenantId?: number }; headers?: Record<string, unknown> }): number {
  if (req.user?.tenantId) {
    return req.user.tenantId;
  }
  const raw = req.headers?.['x-tenant-id'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
