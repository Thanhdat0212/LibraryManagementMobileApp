import { useEffect, useState } from "react";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { BorrowRequest } from "../../types/borrowRequest";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
import { formatDate } from "../../utils/formatDate";

export default function BorrowRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    borrowRequestsApi
      .getAll("Pending")
      .then(setRequests)
      .catch((err) => setError(getErrorMessage(err, "Không tải được danh sách yêu cầu mượn.")))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, []);

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

  async function handleReject(request: BorrowRequest) {
    setProcessingId(request.id);
    setError(null);
    try {
      await borrowRequestsApi.reject(request.id, "Từ chối bởi thủ thư");
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
    { header: "Trạng thái", render: () => <Badge tone="amber">Đang chờ duyệt</Badge> },
    {
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" isLoading={processingId === r.id} onClick={() => handleReject(r)}>
            Từ chối
          </Button>
          <Button isLoading={processingId === r.id} onClick={() => handleApprove(r)}>
            Duyệt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Yêu cầu mượn sách"
        description="Duyệt yêu cầu mượn tự đăng ký từ độc giả — hệ thống sẽ tự gán 1 bản sao khả dụng khi duyệt."
      />
      <ErrorBanner message={error} />
      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={requests}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Không có yêu cầu nào đang chờ duyệt."
        />
      </div>
    </div>
  );
}
