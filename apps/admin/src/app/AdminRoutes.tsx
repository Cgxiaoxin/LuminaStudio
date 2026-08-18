import { CalendarDays, CreditCard, LayoutDashboard, Settings, Store, Ticket, UserCircle, Users } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "./AdminShell";
import DashboardPage from "../pages/DashboardPage";
import StoresPage from "../pages/StoresPage";
import StaffPage from "../pages/StaffPage";
import ServicesPage from "../pages/ServicesPage";
import SchedulesPage from "../pages/SchedulesPage";
import BookingsPage from "../pages/BookingsPage";
import MembershipsPage from "../pages/MembershipsPage";
import MembershipTemplatesPage from "../pages/MembershipTemplatesPage";
import FinancePage from "../pages/FinancePage";
import ReportsPage from "../pages/ReportsPage";
import MarketingPage from "../pages/MarketingPage";
import SettingsPage from "../pages/SettingsPage";
import CustomersPage from "../pages/CustomersPage";
import { useI18n } from "../i18n";
import { canAccessPage, defaultPageForRole, getStoredAdminRole } from "./roleAccess";

const pageDefs = [
  { path: "dashboard", titleKey: "nav.dashboard", icon: LayoutDashboard },
  { path: "stores", titleKey: "nav.stores", icon: Store },
  { path: "customers", titleKey: "nav.customers", icon: UserCircle },
  { path: "staff", titleKey: "nav.staff", icon: Users },
  { path: "classes", titleKey: "nav.services", icon: CalendarDays },
  { path: "schedules", titleKey: "nav.schedules", icon: CalendarDays },
  { path: "bookings", titleKey: "nav.bookings", icon: Ticket },
  { path: "memberships", titleKey: "nav.memberships", icon: Users },
  { path: "membership-templates", titleKey: "nav.membershipTemplates", icon: CreditCard },
  { path: "finance", titleKey: "nav.finance", icon: CreditCard },
  { path: "reports", titleKey: "nav.reports", icon: LayoutDashboard },
  { path: "marketing", titleKey: "nav.marketing", icon: Ticket },
  { path: "settings", titleKey: "nav.settings", icon: Settings },
] as const;

export function AdminRoutes() {
  const { t } = useI18n();
  const role = getStoredAdminRole();
  const home = defaultPageForRole(role);
  const pages = pageDefs
    .filter((page) => canAccessPage(page.path, role))
    .map((page) => ({
      ...page,
      title: t(page.titleKey),
    }));

  return (
    <AdminShell pages={pages}>
      <Routes>
        <Route index element={<Navigate to={`/${home}`} replace />} />
        {canAccessPage("dashboard", role) && <Route path="dashboard" element={<DashboardPage />} />}
        {canAccessPage("stores", role) && <Route path="stores" element={<StoresPage />} />}
        {canAccessPage("customers", role) && <Route path="customers" element={<CustomersPage />} />}
        {canAccessPage("staff", role) && <Route path="staff" element={<StaffPage />} />}
        {canAccessPage("classes", role) && <Route path="classes" element={<ServicesPage />} />}
        {canAccessPage("schedules", role) && <Route path="schedules" element={<SchedulesPage />} />}
        {canAccessPage("bookings", role) && <Route path="bookings" element={<BookingsPage />} />}
        {canAccessPage("memberships", role) && <Route path="memberships" element={<MembershipsPage />} />}
        {canAccessPage("membership-templates", role) && <Route path="membership-templates" element={<MembershipTemplatesPage />} />}
        {canAccessPage("finance", role) && <Route path="finance" element={<FinancePage />} />}
        {canAccessPage("reports", role) && <Route path="reports" element={<ReportsPage />} />}
        {canAccessPage("marketing", role) && <Route path="marketing" element={<MarketingPage />} />}
        {canAccessPage("settings", role) && <Route path="settings" element={<SettingsPage />} />}
        <Route path="*" element={<Navigate to={`/${home}`} replace />} />
      </Routes>
    </AdminShell>
  );
}
