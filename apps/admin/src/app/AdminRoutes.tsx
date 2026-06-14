import { CalendarDays, CreditCard, LayoutDashboard, Settings, Store, Ticket, Users } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "./AdminShell";
import DashboardPage from "../pages/DashboardPage";
import StoresPage from "../pages/StoresPage";
import StaffPage from "../pages/StaffPage";
import ServicesPage from "../pages/ServicesPage";
import SchedulesPage from "../pages/SchedulesPage";
import BookingsPage from "../pages/BookingsPage";
import MembershipsPage from "../pages/MembershipsPage";
import FinancePage from "../pages/FinancePage";
import ReportsPage from "../pages/ReportsPage";
import MarketingPage from "../pages/MarketingPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";

const pages = [
  { path: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { path: "stores", title: "Stores", icon: Store },
  { path: "staff", title: "Staff", icon: Users },
  { path: "classes", title: "Services", icon: CalendarDays },
  { path: "schedules", title: "Schedules", icon: CalendarDays },
  { path: "bookings", title: "Bookings", icon: Ticket },
  { path: "memberships", title: "Memberships", icon: Users },
  { path: "finance", title: "Finance", icon: CreditCard },
  { path: "reports", title: "Reports", icon: LayoutDashboard },
  { path: "marketing", title: "Marketing", icon: Ticket },
  { path: "settings", title: "Settings", icon: Settings },
];

export function AdminRoutes() {
  return (
    <AdminShell pages={pages}>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="stores" element={<StoresPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="classes" element={<ServicesPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="memberships" element={<MembershipsPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Routes>
    </AdminShell>
  );
}
