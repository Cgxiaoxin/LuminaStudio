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
  const pages = pageDefs.map((page) => ({
    ...page,
    title: t(page.titleKey),
  }));

  return (
    <AdminShell pages={pages}>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="stores" element={<StoresPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="classes" element={<ServicesPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="memberships" element={<MembershipsPage />} />
        <Route path="membership-templates" element={<MembershipTemplatesPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AdminShell>
  );
}
