import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
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
      </aside>
      <main className="main-panel">{children}</main>
    </div>
  );
}
