export const ADMIN_ROLES = ['OWNER', 'ADMIN', 'STAFF', 'COACH'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

const ALL_PAGES = [
  'dashboard',
  'stores',
  'customers',
  'staff',
  'classes',
  'schedules',
  'bookings',
  'memberships',
  'membership-templates',
  'finance',
  'reports',
  'marketing',
  'settings',
] as const;

export type AdminPagePath = (typeof ALL_PAGES)[number];

const ROLE_PAGES: Record<string, readonly AdminPagePath[]> = {
  OWNER: ALL_PAGES,
  ADMIN: ALL_PAGES,
  STAFF: ['stores', 'customers', 'staff', 'classes', 'schedules', 'bookings', 'memberships', 'finance'],
  COACH: ['schedules', 'bookings'],
};

export function getStoredAdminRole(): string {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || '';
  } catch {
    return '';
  }
}

export function getAllowedPages(role?: string): readonly AdminPagePath[] {
  return ROLE_PAGES[role || ''] || ROLE_PAGES.STAFF;
}

export function canAccessPage(path: string, role?: string): boolean {
  return getAllowedPages(role).includes(path as AdminPagePath);
}

export function defaultPageForRole(role?: string): AdminPagePath {
  return getAllowedPages(role)[0] || 'bookings';
}

export function isOwnerOrAdmin(role?: string): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}
