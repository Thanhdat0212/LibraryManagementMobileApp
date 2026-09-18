import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BookCopy,
  BookOpen,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PenLine,
  Receipt,
  Repeat,
  Tags,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { dashboardApi } from "../../api/dashboardApi";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then((summary) => setPendingRequestCount(summary.pendingBorrowRequests))
      .catch(() => undefined);
  }, []);

  const navSections: NavSection[] = [
    { items: [{ to: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard }] },
    {
      label: "Danh mục",
      items: [
        { to: "/admin/books", label: "Sách", icon: BookOpen },
        { to: "/admin/book-copies", label: "Bản sao sách", icon: BookCopy },
        { to: "/admin/authors", label: "Tác giả", icon: PenLine },
        { to: "/admin/categories", label: "Thể loại", icon: Tags },
        { to: "/admin/publishers", label: "Nhà xuất bản", icon: Building2 },
      ],
    },
    {
      label: "Lưu thông",
      items: [
        { to: "/admin/borrow-records", label: "Phiếu mượn", icon: Repeat },
        { to: "/admin/borrow-requests", label: "Yêu cầu mượn", icon: ClipboardList, badge: pendingRequestCount },
        { to: "/admin/fines", label: "Tiền phạt", icon: Receipt },
      ],
    },
    { label: "Hệ thống", items: [{ to: "/admin/users", label: "Người dùng", icon: Users }] },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 -translate-x-full flex-col overflow-y-auto
          border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : ""}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Thư viện</p>
            <p className="text-xs text-slate-500">Trang quản trị</p>
          </div>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-3 p-3">
          {navSections.map((section, index) => (
            <div key={section.label ?? index}>
              {section.label && (
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{section.label}</p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </span>
                    {!!item.badge && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3">
          <p className="truncate px-1 text-sm font-medium text-slate-700">{user?.fullName}</p>
          <p className="truncate px-1 text-xs text-slate-400">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold text-slate-900">Thư viện</p>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
