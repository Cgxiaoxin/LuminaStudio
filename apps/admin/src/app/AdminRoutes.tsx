import { CalendarDays, CreditCard, LayoutDashboard, Settings, Store, Ticket, Users } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminShell } from "./AdminShell";
import DashboardPage from "../pages/DashboardPage";
import StoresPage from "../pages/StoresPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";

const pages = [
  { path: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { path: "stores", title: "Stores", icon: Store },
  { path: "staff", title: "Staff", icon: Users },
  { path: "classes", title: "Classes", icon: CalendarDays },
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
        {pages.filter(p => p.path !== "dashboard" && p.path !== "stores").map((page) => (
          <Route key={page.path} path={page.path} element={<PlaceholderPage title={page.title} />} />
        ))}
      </Routes>
    </AdminShell>
  );
}
