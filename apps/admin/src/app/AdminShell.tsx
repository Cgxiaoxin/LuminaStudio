import type { PropsWithChildren } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ShellPage = {
  path: string;
  title: string;
  icon: LucideIcon;
};

type AdminShellProps = PropsWithChildren<{
  pages: ShellPage[];
}>;

export function AdminShell({ children, pages }: AdminShellProps) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">LS</span>
          <div>
            <strong>LuminaStudio</strong>
            <span>Operations</span>
          </div>
        </div>
        <nav>
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <NavLink key={page.path} to={`/${page.path}`} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
                <Icon size={18} />
                <span>{page.title}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user.displayName || "Admin"}</span>
            <span className="user-role">{user.role || ""}</span>
          </div>
          <Button type="text" icon={<LogOut size={16} />} onClick={handleLogout} />
        </div>
      </aside>
      <main className="main-panel">{children}</main>
    </div>
  );
}
