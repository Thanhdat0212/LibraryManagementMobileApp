import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin/dashboard", label: "Tổng quan" },
  { to: "/admin/books", label: "Sách" },
  { to: "/admin/book-copies", label: "Bản sao sách" },
  { to: "/admin/authors", label: "Tác giả" },
  { to: "/admin/categories", label: "Thể loại" },
  { to: "/admin/publishers", label: "Nhà xuất bản" },
  { to: "/admin/borrow-records", label: "Phiếu mượn" },
  { to: "/admin/borrow-requests", label: "Yêu cầu mượn" },
  { to: "/admin/fines", label: "Tiền phạt" },
  { to: "/admin/users", label: "Người dùng" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">Thư viện</p>
          <p className="text-xs text-slate-500">Trang quản trị</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
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
      <main className="flex-1 overflow-x-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}
