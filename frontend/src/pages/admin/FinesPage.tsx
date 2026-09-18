import { useEffect, useState } from "react";
import { finesApi } from "../../api/finesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Fine, FineStatus } from "../../types/fine";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const reasonLabel: Record<Fine["reason"], string> = {
  Overdue: "Trả trễ hạn",
  Lost: "Mất sách",
  Damaged: "Hư hỏng",
};

const statusTabs: { value: FineStatus; label: string }[] = [
  { value: "Unpaid", label: "Chưa thanh toán" },
  { value: "Paid", label: "Đã thanh toán" },
  { value: "Waived", label: "Đã miễn" },
];

const statusBadge: Record<FineStatus, { tone: "red" | "green" | "gray"; label: string }> = {
  Unpaid: { tone: "red", label: "Chưa thanh toán" },
  Paid: { tone: "green", label: "Đã thanh toán" },
  Waived: { tone: "gray", label: "Đã miễn" },
};

export default function FinesPage() {
  const [status, setStatus] = useState<FineStatus>("Unpaid");
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    finesApi
      .getAll(status)
      .then(setFines)
      .catch((err) => setError(getErrorMessage(err, "Không tải được danh sách phạt.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [status]);

  async function handlePay(fine: Fine) {
    setProcessingId(fine.id);
    setError(null);
    try {
      await finesApi.pay(fine.id);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không xác nhận được thanh toán."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleWaive(fine: Fine) {
    setProcessingId(fine.id);
    setError(null);
    try {
      await finesApi.waive(fine.id);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không miễn được khoản phạt này."));
    } finally {
      setProcessingId(null);
    }
  }

  const columns: Column<Fine>[] = [
    { header: "Sách", render: (f) => <span className="font-medium text-slate-900">{f.bookTitle}</span> },
    { header: "Độc giả", render: (f) => f.userName },
    { header: "Lý do", render: (f) => reasonLabel[f.reason] },
    { header: "Số tiền", render: (f) => formatCurrency(f.amount) },
    { header: "Ngày lập", render: (f) => formatDate(f.createdAt) },
    {
      header: "Trạng thái",
      render: (f) => <Badge tone={statusBadge[f.status].tone}>{statusBadge[f.status].label}</Badge>,
    },
    {
      header: "",
      className: "text-right",
      render: (f) =>
        f.status === "Unpaid" ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" isLoading={processingId === f.id} onClick={() => handleWaive(f)}>
              Miễn phạt
            </Button>
            <Button isLoading={processingId === f.id} onClick={() => handlePay(f)}>
              Xác nhận đã thu
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Tiền phạt" description="Danh sách khoản phạt trả trễ, thu tại quầy hoặc miễn khi cần." />
      <div className="mb-4 flex gap-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              status === tab.value ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ErrorBanner message={error} />
      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={fines}
          rowKey={(f) => f.id}
          isLoading={isLoading}
          emptyMessage="Không có khoản phạt nào."
        />
      </div>
    </div>
  );
}
