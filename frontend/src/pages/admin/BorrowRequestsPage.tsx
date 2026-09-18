import { useEffect, useState } from "react";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { BorrowRequest, BorrowRequestStatus } from "../../types/borrowRequest";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Textarea from "../../components/ui/Textarea";
import { formatDate } from "../../utils/formatDate";

const statusTabs: { value: BorrowRequestStatus; label: string }[] = [
  { value: "Pending", label: "Đang chờ duyệt" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Rejected", label: "Đã từ chối" },
  { value: "Cancelled", label: "Đã hủy" },
];

const statusBadge: Record<BorrowRequestStatus, { tone: "amber" | "green" | "red" | "gray"; label: string }> = {
  Pending: { tone: "amber", label: "Đang chờ duyệt" },
  Approved: { tone: "green", label: "Đã duyệt" },
  Rejected: { tone: "red", label: "Đã từ chối" },
  Cancelled: { tone: "gray", label: "Đã hủy" },
};

export default function BorrowRequestsPage() {
  const [status, setStatus] = useState<BorrowRequestStatus>("Pending");
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [rejectTarget, setRejectTarget] = useState<BorrowRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    setIsLoading(true);
    setError(null);
    borrowRequestsApi
      .getAll(status)
      .then(setRequests)
      .catch((err) => setError(getErrorMessage(err, "Không tải được danh sách yêu cầu mượn.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [status]);

  async function handleApprove(request: BorrowRequest) {
    setProcessingId(request.id);
    setError(null);
    try {
      await borrowRequestsApi.approve(request.id);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không duyệt được yêu cầu này."));
    } finally {
      setProcessingId(null);
    }
  }

  function openRejectDialog(request: BorrowRequest) {
    setRejectTarget(request);
    setRejectReason("");
  }

  async function handleConfirmReject() {
    if (!rejectTarget) return;
    setProcessingId(rejectTarget.id);
    setError(null);
    try {
      await borrowRequestsApi.reject(rejectTarget.id, rejectReason.trim() || undefined);
      setRejectTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Không từ chối được yêu cầu này."));
    } finally {
      setProcessingId(null);
    }
  }

  const columns: Column<BorrowRequest>[] = [
    { header: "Sách", render: (r) => <span className="font-medium text-slate-900">{r.bookTitle}</span> },
    { header: "Độc giả", render: (r) => r.userName },
    { header: "Ngày yêu cầu", render: (r) => formatDate(r.requestedAt) },
    { header: "Ghi chú", render: (r) => r.note || "—" },
    {
      header: "Trạng thái",
      render: (r) => <Badge tone={statusBadge[r.status].tone}>{statusBadge[r.status].label}</Badge>,
    },
    {
      header: "",
      className: "text-right",
      render: (r) =>
        r.status === "Pending" ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" isLoading={processingId === r.id} onClick={() => openRejectDialog(r)}>
              Từ chối
            </Button>
            <Button isLoading={processingId === r.id} onClick={() => handleApprove(r)}>
              Duyệt
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Yêu cầu mượn sách"
        description="Duyệt yêu cầu mượn tự đăng ký từ độc giả — hệ thống sẽ tự gán 1 bản sao khả dụng khi duyệt."
      />
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
          rows={requests}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Không có yêu cầu nào ở trạng thái này."
        />
      </div>

      <Modal open={!!rejectTarget} title="Từ chối yêu cầu mượn" onClose={() => setRejectTarget(null)} widthClassName="max-w-sm">
        <p className="text-sm text-slate-600">
          Từ chối yêu cầu mượn "{rejectTarget?.bookTitle}" của {rejectTarget?.userName}.
        </p>
        <Textarea
          className="mt-3 w-full"
          label="Lý do (không bắt buộc)"
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRejectTarget(null)} disabled={processingId === rejectTarget?.id}>
            Hủy
          </Button>
          <Button variant="danger" isLoading={processingId === rejectTarget?.id} onClick={handleConfirmReject}>
            Từ chối
          </Button>
        </div>
      </Modal>
    </div>
  );
}
