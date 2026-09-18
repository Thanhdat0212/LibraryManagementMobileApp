import { useEffect, useState } from "react";
import { dashboardApi } from "../../api/dashboardApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { DashboardSummary } from "../../types/dashboard";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency } from "../../utils/formatCurrency";

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

  const tiles = summary
    ? [
        { label: "Tổng số sách", value: summary.totalBooks },
        { label: "Bản sao sẵn sàng", value: `${summary.availableCopies}/${summary.totalCopies}` },
        { label: "Đang được mượn", value: summary.activeBorrows },
        { label: "Quá hạn", value: summary.overdueBorrows, danger: summary.overdueBorrows > 0 },
        { label: "Yêu cầu chờ duyệt", value: summary.pendingBorrowRequests, danger: summary.pendingBorrowRequests > 0 },
        {
          label: "Phạt chưa thu",
          value: summary.unpaidFinesCount > 0 ? `${summary.unpaidFinesCount} (${formatCurrency(summary.unpaidFinesAmount)})` : 0,
          danger: summary.unpaidFinesCount > 0,
        },
        { label: "Tổng người dùng", value: summary.totalUsers },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Tổng quan" description="Số liệu vận hành thư viện." />
      <ErrorBanner message={error} />
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className={`text-2xl font-bold ${tile.danger ? "text-red-600" : "text-indigo-600"}`}>{tile.value}</p>
              <p className="mt-1 text-xs text-slate-500">{tile.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
