import { useEffect, useState } from "react";
import { finesApi } from "../../api/finesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Fine } from "../../types/fine";
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

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    finesApi
      .getAll("Unpaid")
      .then(setFines)
      .catch((err) => setError(getErrorMessage(err, "Không tải được danh sách phạt.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handlePay(fine: Fine) {
    setPayingId(fine.id);
    setError(null);
    try {
      await finesApi.pay(fine.id);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không xác nhận được thanh toán."));
    } finally {
      setPayingId(null);
    }
  }

  const columns: Column<Fine>[] = [
    { header: "Sách", render: (f) => <span className="font-medium text-slate-900">{f.bookTitle}</span> },
    { header: "Độc giả", render: (f) => f.userName },
    { header: "Lý do", render: (f) => reasonLabel[f.reason] },
    { header: "Số tiền", render: (f) => formatCurrency(f.amount) },
    { header: "Ngày lập", render: (f) => formatDate(f.createdAt) },
    { header: "Trạng thái", render: () => <Badge tone="red">Chưa thanh toán</Badge> },
    {
      header: "",
      className: "text-right",
      render: (f) => (
        <Button isLoading={payingId === f.id} onClick={() => handlePay(f)}>
          Xác nhận đã thu
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Tiền phạt" description="Danh sách khoản phạt trả trễ chưa thu tại quầy." />
      <ErrorBanner message={error} />
      <div className="mt-3">
        <DataTable columns={columns} rows={fines} rowKey={(f) => f.id} isLoading={isLoading} emptyMessage="Không có khoản phạt nào chưa thanh toán." />
      </div>
    </div>
  );
}
