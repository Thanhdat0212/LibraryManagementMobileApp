import { useEffect, useState, type FormEvent } from "react";
import { borrowRecordsApi } from "../../api/borrowRecordsApi";
import { bookCopiesApi } from "../../api/bookCopiesApi";
import { usersApi } from "../../api/usersApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { BorrowRecord } from "../../types/borrowRecord";
import type { BookCopy } from "../../types/bookCopy";
import type { User } from "../../types/user";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../components/ui/DataTable";
import Notice from "../../components/ui/Notice";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import { formatDate } from "../../utils/formatDate";
import { borrowStatusLabel, borrowStatusTone, effectiveBorrowStatus } from "../../utils/statusMeta";

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export default function BorrowRecordsPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bookCopyId, setBookCopyId] = useState("");
  const [userId, setUserId] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [returnTarget, setReturnTarget] = useState<BorrowRecord | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  const [search, setSearch] = useState("");
  const [renewingId, setRenewingId] = useState<number | null>(null);

  async function loadAll() {
    setIsLoading(true);
    setListError(null);
    try {
      const [recordsRes, copiesRes, usersRes] = await Promise.all([
        borrowRecordsApi.getAll(),
        bookCopiesApi.getAll(),
        usersApi.getAll(),
      ]);
      setRecords(recordsRes);
      setAvailableCopies(copiesRes.filter((c) => c.status === "Available"));
      setUsers(usersRes);
    } catch (err) {
      setListError(getErrorMessage(err, "Không tải được danh sách phiếu mượn."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreateForm() {
    setBookCopyId("");
    setUserId("");
    setDueDate(defaultDueDate());
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!bookCopyId || !userId || !dueDate) {
      setFormError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setIsSaving(true);
    try {
      await borrowRecordsApi.borrow({
        bookCopyId: Number(bookCopyId),
        userId: Number(userId),
        dueDate: new Date(dueDate).toISOString(),
      });
      setIsFormOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(getErrorMessage(err, "Không tạo được phiếu mượn."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReturn() {
    if (!returnTarget) return;
    setIsReturning(true);
    try {
      await borrowRecordsApi.returnCopy(returnTarget.id);
      setReturnTarget(null);
      await loadAll();
    } catch (err) {
      setListError(getErrorMessage(err, "Không xác nhận trả sách được."));
      setReturnTarget(null);
    } finally {
      setIsReturning(false);
    }
  }

  async function handleRenew(record: BorrowRecord) {
    setRenewingId(record.id);
    setListError(null);
    try {
      await borrowRecordsApi.renew(record.id);
      await loadAll();
    } catch (err) {
      setListError(getErrorMessage(err, "Không gia hạn được phiếu mượn này."));
    } finally {
      setRenewingId(null);
    }
  }

  const filteredRecords = records.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return r.bookTitle.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q);
  });

  const columns: Column<BorrowRecord>[] = [
    { header: "Sách", render: (r) => <span className="font-medium text-slate-900">{r.bookTitle}</span> },
    { header: "Độc giả", render: (r) => r.userName },
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
        r.status === "Borrowing" ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" isLoading={renewingId === r.id} onClick={() => handleRenew(r)}>
              Gia hạn ({r.renewalCount} lần)
            </Button>
            <Button variant="secondary" onClick={() => setReturnTarget(r)}>
              Xác nhận trả
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Phiếu mượn"
        description="Lập phiếu mượn khi giao sách và xác nhận khi nhận lại sách tại quầy."
        actions={<Button onClick={openCreateForm}>+ Lập phiếu mượn</Button>}
      />
      <Notice tone="danger" message={listError} className="mb-3" />
      <div className="mb-3 max-w-xs">
        <Input placeholder="Tìm theo tên sách hoặc độc giả..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={filteredRecords}
          rowKey={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="Chưa có phiếu mượn nào."
        />
      </div>

      <Modal open={isFormOpen} title="Lập phiếu mượn" onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Select label="Bản sao sách (đang sẵn sàng)" required value={bookCopyId} onChange={(e) => setBookCopyId(e.target.value)}>
            <option value="">-- Chọn bản sao --</option>
            {availableCopies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.copyCode} — {c.bookTitle}
              </option>
            ))}
          </Select>
          <Select label="Độc giả" required value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">-- Chọn độc giả --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.email})
              </option>
            ))}
          </Select>
          <Input label="Hạn trả" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Notice tone="danger" message={formError} />
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Lập phiếu
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!returnTarget}
        title="Xác nhận trả sách"
        message={`Xác nhận "${returnTarget?.userName}" đã trả sách "${returnTarget?.bookTitle}"?`}
        confirmLabel="Xác nhận"
        confirmVariant="primary"
        isLoading={isReturning}
        onConfirm={handleReturn}
        onCancel={() => setReturnTarget(null)}
      />
    </div>
  );
}
