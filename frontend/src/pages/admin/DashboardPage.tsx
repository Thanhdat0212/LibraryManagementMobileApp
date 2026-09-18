import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, BookCopy, BookOpen, ClipboardList, Receipt, Repeat, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { dashboardApi } from "../../api/dashboardApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { DashboardSummary } from "../../types/dashboard";
import Notice from "../../components/ui/Notice";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/formatCurrency";

interface ActionTile {
  label: string;
  value: string | number;
  to: string;
  icon: LucideIcon;
}

interface StatTile {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then(setSummary)
      .catch((err) => setError(getErrorMessage(err, "Không tải được số liệu tổng quan.")))
      .finally(() => setIsLoading(false));
  }, []);

  const actionTiles: ActionTile[] = summary
    ? [
        { label: "Yêu cầu chờ duyệt", value: summary.pendingBorrowRequests, to: "/admin/borrow-requests", icon: ClipboardList },
        { label: "Quá hạn", value: summary.overdueBorrows, to: "/admin/borrow-records", icon: AlertTriangle },
        {
          label: "Phạt chưa thu",
          value: summary.unpaidFinesCount > 0 ? `${summary.unpaidFinesCount} (${formatCurrency(summary.unpaidFinesAmount)})` : 0,
          to: "/admin/fines",
          icon: Receipt,
        },
      ]
    : [];

  const overviewTiles: StatTile[] = summary
    ? [
        { label: "Tổng số sách", value: summary.totalBooks, icon: BookOpen },
        { label: "Bản sao sẵn sàng", value: `${summary.availableCopies}/${summary.totalCopies}`, icon: BookCopy },
        { label: "Đang được mượn", value: summary.activeBorrows, icon: Repeat },
        { label: "Tổng người dùng", value: summary.totalUsers, icon: Users },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Tổng quan" description="Số liệu vận hành thư viện." />
      <Notice tone="danger" message={error} className="mb-3" />
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Cần xử lý</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {actionTiles.map((tile) => {
                const isActive = Number(String(tile.value).replace(/\D/g, "")) > 0;
                return (
                  <Link
                    key={tile.label}
                    to={tile.to}
                    className={`flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 ${
                      isActive ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isActive ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <tile.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className={`text-xl font-bold ${isActive ? "text-red-600" : "text-slate-900"}`}>{tile.value}</p>
                      <p className="text-xs text-slate-500">{tile.label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Tổng quan</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {overviewTiles.map((tile) => (
                <div key={tile.label} className="rounded-lg border border-slate-200 bg-white p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <tile.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-2 text-xl font-bold text-slate-900">{tile.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{tile.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
