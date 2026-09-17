import { useEffect, useState } from "react";
import { borrowRecordsApi } from "../../api/borrowRecordsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { BorrowRecord, BorrowStatus } from "../../types/borrowRecord";
import Badge from "../../components/ui/Badge";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
import { formatDate } from "../../utils/formatDate";

const statusTone: Record<BorrowStatus, "blue" | "green"> = {
  Borrowing: "blue",
  Returned: "green",
};

const statusLabel: Record<BorrowStatus, string> = {
  Borrowing: "Đang mượn",
  Returned: "Đã trả",
};

export default function MyBorrowsPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    borrowRecordsApi
      .getMy()
      .then(setRecords)
      .catch((err) => setError(getErrorMessage(err, "Không tải được lịch sử mượn sách.")))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<BorrowRecord>[] = [
    { header: "Sách", render: (r) => <span className="font-medium text-slate-900">{r.bookTitle}</span> },
    { header: "Ngày mượn", render: (r) => formatDate(r.borrowDate) },
    { header: "Hạn trả", render: (r) => formatDate(r.dueDate) },
    { header: "Ngày trả", render: (r) => formatDate(r.returnDate) },
    { header: "Trạng thái", render: (r) => <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Sách đang mượn"
        description="Lịch sử mượn sách của bạn. Việc mượn/trả sách được thực hiện tại quầy thủ thư."
      />
      <ErrorBanner message={error} />
      <div className="mt-3">
        <DataTable columns={columns} rows={records} rowKey={(r) => r.id} isLoading={isLoading} emptyMessage="Bạn chưa mượn sách nào." />
      </div>
    </div>
  );
}
