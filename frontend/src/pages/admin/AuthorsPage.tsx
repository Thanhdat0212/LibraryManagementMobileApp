import { useEffect, useState, type FormEvent } from "react";
import { authorsApi } from "../../api/authorsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Author } from "../../types/author";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../components/ui/DataTable";
import Notice from "../../components/ui/Notice";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import RowActions from "../../components/ui/RowActions";
import Textarea from "../../components/ui/Textarea";

const emptyForm = { fullName: "", bio: "", nationality: "" };

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Author | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadAuthors() {
    setIsLoading(true);
    setListError(null);
    try {
      setAuthors(await authorsApi.getAll());
    } catch (err) {
      setListError(getErrorMessage(err, "Không tải được danh sách tác giả."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAuthors();
  }, []);

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(author: Author) {
    setEditing(author);
    setForm({ fullName: author.fullName, bio: author.bio ?? "", nationality: author.nationality ?? "" });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    const payload = {
      fullName: form.fullName,
      bio: form.bio || null,
      nationality: form.nationality || null,
    };
    try {
      if (editing) {
        await authorsApi.update(editing.id, payload);
      } else {
        await authorsApi.create(payload);
      }
      setIsFormOpen(false);
      await loadAuthors();
    } catch (err) {
      setFormError(getErrorMessage(err, "Không lưu được tác giả."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await authorsApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadAuthors();
    } catch (err) {
      setListError(getErrorMessage(err, "Không xóa được tác giả."));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Author>[] = [
    { header: "Họ tên", render: (a) => <span className="font-medium text-slate-900">{a.fullName}</span> },
    { header: "Quốc tịch", render: (a) => a.nationality || "—" },
    { header: "Tiểu sử", render: (a) => <span className="line-clamp-2 max-w-md text-slate-500">{a.bio || "—"}</span> },
    {
      header: "",
      className: "text-right",
      render: (a) => <RowActions onEdit={() => openEditForm(a)} onDelete={() => setDeleteTarget(a)} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tác giả"
        description="Quản lý danh sách tác giả sách."
        actions={<Button onClick={openCreateForm}>+ Thêm tác giả</Button>}
      />
      <Notice tone="danger" message={listError} className="mb-3" />
      <div className="mt-3">
        <DataTable columns={columns} rows={authors} rowKey={(a) => a.id} isLoading={isLoading} emptyMessage="Chưa có tác giả nào." />
      </div>

      <Modal open={isFormOpen} title={editing ? "Sửa tác giả" : "Thêm tác giả"} onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Họ tên"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            label="Quốc tịch"
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          />
          <Textarea
            label="Tiểu sử"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
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
        title="Xóa tác giả"
        message={`Bạn có chắc muốn xóa tác giả "${deleteTarget?.fullName}"?`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
