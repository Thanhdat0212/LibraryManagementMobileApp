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
import Notice from "../../components/ui/Notice";
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

interface ActionFeedback {
  tone: "success" | "danger";
  text: string;
}

export default function MyBorrowsPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

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
    setActionFeedback(null);
    try {
      await borrowRecordsApi.renew(record.id);
      setActionFeedback({ tone: "success", text: `Đã gia hạn "${record.bookTitle}" thành công.` });
      load();
    } catch (err) {
      setActionFeedback({ tone: "danger", text: getErrorMessage(err, "Không gia hạn được phiếu mượn này.") });
    } finally {
      setRenewingId(null);
    }
  }

  async function handleCancelRequest(request: BorrowRequest) {
    setCancellingId(request.id);
    setActionFeedback(null);
    try {
      await borrowRequestsApi.cancel(request.id);
      setActionFeedback({ tone: "success", text: `Đã hủy yêu cầu mượn "${request.bookTitle}".` });
      load();
    } catch (err) {
      setActionFeedback({ tone: "danger", text: getErrorMessage(err, "Không hủy được yêu cầu mượn này.") });
    } finally {
      setCancellingId(null);
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
      <Notice tone="danger" message={error} className="mb-3" />
      {actionFeedback && <Notice tone={actionFeedback.tone} message={actionFeedback.text} className="mb-3" />}

      {fines.length > 0 && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-medium">
            Bạn có {fines.length} khoản phạt chưa thanh toán, tổng {formatCurrency(fines.reduce((sum, f) => sum + f.amount, 0))}.
            Vui lòng thanh toán tại quầy thủ thư.
          </p>
        </div>
      )}

      {requests.length > 0 && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <p className="font-medium">Yêu cầu mượn đang chờ duyệt ({requests.length}):</p>
          <ul className="mt-1 space-y-1">
            {requests.map((r) => (
              <li key={r.id} className="flex list-none items-center justify-between gap-2">
                <span>
                  {r.bookTitle} — {requestStatusLabel[r.status]}
                </span>
                <Button
                  variant="ghost"
                  className="!px-2 !py-1 text-red-600 hover:bg-red-50"
                  isLoading={cancellingId === r.id}
                  onClick={() => handleCancelRequest(r)}
                >
                  Hủy yêu cầu
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <DataTable columns={columns} rows={records} rowKey={(r) => r.id} isLoading={isLoading} emptyMessage="Bạn chưa mượn sách nào." />
      </div>
    </div>
  );
}
