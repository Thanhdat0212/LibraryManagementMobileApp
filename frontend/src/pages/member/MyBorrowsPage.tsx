import { useEffect, useState } from "react";
import { borrowRecordsApi } from "../../api/borrowRecordsApi";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { finesApi } from "../../api/finesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { BorrowRecord } from "../../types/borrowRecord";
import type { BorrowRequest } from "../../types/borrowRequest";
import type { Fine } from "../../types/fine";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { borrowStatusLabel, borrowStatusTone, effectiveBorrowStatus } from "../../utils/statusMeta";

const requestStatusLabel: Record<BorrowRequest["status"], string> = {
  Pending: "Đang chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Đã từ chối",
  Cancelled: "Đã hủy",
};

export default function MyBorrowsPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [renewMessage, setRenewMessage] = useState<string | null>(null);

  function load() {
    setIsLoading(true);
    Promise.all([borrowRecordsApi.getMy(), borrowRequestsApi.getMy(), finesApi.getMy()])
      .then(([recordsRes, requestsRes, finesRes]) => {
        setRecords(recordsRes);
        setRequests(requestsRes.filter((r) => r.status === "Pending"));
        setFines(finesRes.filter((f) => f.status === "Unpaid"));
      })
      .catch((err) => setError(getErrorMessage(err, "Không tải được lịch sử mượn sách.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

  async function handleRenew(record: BorrowRecord) {
    setRenewingId(record.id);
    setRenewMessage(null);
    try {
      await borrowRecordsApi.renew(record.id);
      setRenewMessage(`Đã gia hạn "${record.bookTitle}" thành công.`);
      load();
    } catch (err) {
      setRenewMessage(getErrorMessage(err, "Không gia hạn được phiếu mượn này."));
    } finally {
      setRenewingId(null);
    }
  }

  const columns: Column<BorrowRecord>[] = [
    { header: "Sách", render: (r) => <span className="font-medium text-slate-900">{r.bookTitle}</span> },
    { header: "Ngày mượn", render: (r) => formatDate(r.borrowDate) },
    { header: "Hạn trả", render: (r) => formatDate(r.dueDate) },
    { header: "Ngày trả", render: (r) => formatDate(r.returnDate) },
    {
      header: "Trạng thái",
      render: (r) => {
        const status = effectiveBorrowStatus(r);
        return <Badge tone={borrowStatusTone[status]}>{borrowStatusLabel[status]}</Badge>;
      },
    },
    {
      header: "",
      className: "text-right",
      render: (r) =>
        r.status === "Borrowing" && effectiveBorrowStatus(r) === "Borrowing" ? (
          <Button variant="secondary" isLoading={renewingId === r.id} onClick={() => handleRenew(r)}>
            Gia hạn ({r.renewalCount} lần)
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sách đang mượn"
        description="Lịch sử mượn sách của bạn. Việc giao/nhận sách được thực hiện tại quầy thủ thư."
      />
      <ErrorBanner message={error} />
      {renewMessage && (
        <div className="mb-3 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          {renewMessage}
        </div>
      )}

      {requests.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <p className="font-medium">Yêu cầu mượn đang chờ duyệt ({requests.length}):</p>
          <ul className="mt-1 list-inside list-disc">
            {requests.map((r) => (
              <li key={r.id}>
                {r.bookTitle} — {requestStatusLabel[r.status]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fines.length > 0 && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-medium">
            Bạn có {fines.length} khoản phạt chưa thanh toán, tổng {formatCurrency(fines.reduce((sum, f) => sum + f.amount, 0))}.
            Vui lòng thanh toán tại quầy thủ thư.
          </p>
        </div>
      )}

      <div className="mt-3">
        <DataTable columns={columns} rows={records} rowKey={(r) => r.id} isLoading={isLoading} emptyMessage="Bạn chưa mượn sách nào." />
      </div>
    </div>
  );
}
