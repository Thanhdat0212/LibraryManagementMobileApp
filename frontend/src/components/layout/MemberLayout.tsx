import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/catalog", label: "Danh mục sách" },
  { to: "/my-borrows", label: "Sách đang mượn" },
];

export default function MemberLayout() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-900">Thư viện</span>
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-sm text-slate-500">{user?.fullName}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </div>
          <button
            type="button"
            aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 sm:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-200 px-4 py-3 sm:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClassName} onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-500">{user?.fullName}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
