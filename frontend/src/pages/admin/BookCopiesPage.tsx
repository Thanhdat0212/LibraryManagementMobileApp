import { useEffect, useState, type FormEvent } from "react";
import { bookCopiesApi } from "../../api/bookCopiesApi";
import { booksApi } from "../../api/booksApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { BookCopy, BookCopyStatus } from "../../types/bookCopy";
import type { Book } from "../../types/book";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../components/ui/DataTable";
import Notice from "../../components/ui/Notice";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import RowActions from "../../components/ui/RowActions";
import Select from "../../components/ui/Select";

const statusTone: Record<BookCopyStatus, "green" | "blue" | "red" | "amber"> = {
  Available: "green",
  Borrowed: "blue",
  Lost: "red",
  Damaged: "amber",
};

const statusLabel: Record<BookCopyStatus, string> = {
  Available: "Sẵn sàng",
  Borrowed: "Đang mượn",
  Lost: "Mất",
  Damaged: "Hư hỏng",
};

interface FormState {
  copyCode: string;
  bookId: string;
  status: BookCopyStatus;
}

const emptyForm: FormState = { copyCode: "", bookId: "", status: "Available" };

export default function BookCopiesPage() {
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<BookCopy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BookCopy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    setListError(null);
    try {
      const [copiesRes, booksRes] = await Promise.all([bookCopiesApi.getAll(), booksApi.getAll({ pageSize: 100 })]);
      setCopies(copiesRes);
      setBooks(booksRes.items);
    } catch (err) {
      setListError(getErrorMessage(err, "Không tải được danh sách bản sao sách."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(copy: BookCopy) {
    setEditing(copy);
    setForm({ copyCode: copy.copyCode, bookId: String(copy.bookId), status: copy.status });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!editing && !form.bookId) {
      setFormError("Vui lòng chọn sách.");
      return;
    }
    setIsSaving(true);
    try {
      if (editing) {
        await bookCopiesApi.update(editing.id, { copyCode: form.copyCode, status: form.status });
      } else {
        await bookCopiesApi.create({ copyCode: form.copyCode, bookId: Number(form.bookId) });
      }
      setIsFormOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(getErrorMessage(err, "Không lưu được bản sao sách."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await bookCopiesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      setListError(getErrorMessage(err, "Không xóa được bản sao sách."));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<BookCopy>[] = [
    { header: "Mã bản sao", render: (c) => <span className="font-medium text-slate-900">{c.copyCode}</span> },
    { header: "Sách", render: (c) => c.bookTitle },
    { header: "Trạng thái", render: (c) => <Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge> },
    {
      header: "",
      className: "text-right",
      render: (c) => <RowActions onEdit={() => openEditForm(c)} onDelete={() => setDeleteTarget(c)} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bản sao sách"
        description="Quản lý các bản sao vật lý của từng đầu sách."
        actions={<Button onClick={openCreateForm}>+ Thêm bản sao</Button>}
      />
      <Notice tone="danger" message={listError} className="mb-3" />
      <div className="mt-3">
        <DataTable columns={columns} rows={copies} rowKey={(c) => c.id} isLoading={isLoading} emptyMessage="Chưa có bản sao nào." />
      </div>

      <Modal open={isFormOpen} title={editing ? "Sửa bản sao sách" : "Thêm bản sao sách"} onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Mã bản sao"
            required
            value={form.copyCode}
            onChange={(e) => setForm({ ...form, copyCode: e.target.value })}
          />
          {editing ? (
            <Select
              label="Trạng thái"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as BookCopyStatus })}
            >
              {(Object.keys(statusLabel) as BookCopyStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </Select>
          ) : (
            <Select label="Sách" required value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })}>
              <option value="">-- Chọn sách --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </Select>
          )}
          <Notice tone="danger" message={formError} />
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Lưu
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa bản sao sách"
        message={`Bạn có chắc muốn xóa bản sao "${deleteTarget?.copyCode}"?`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
