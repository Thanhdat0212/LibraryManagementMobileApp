import { useEffect, useState, type FormEvent } from "react";
import { publishersApi } from "../../api/publishersApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Publisher } from "../../types/publisher";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";

const emptyForm = { name: "", address: "", phone: "" };

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Publisher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Publisher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadPublishers() {
    setIsLoading(true);
    setListError(null);
    try {
      setPublishers(await publishersApi.getAll());
    } catch (err) {
      setListError(getErrorMessage(err, "Không tải được danh sách nhà xuất bản."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPublishers();
  }, []);

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(publisher: Publisher) {
    setEditing(publisher);
    setForm({ name: publisher.name, address: publisher.address ?? "", phone: publisher.phone ?? "" });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    const payload = { name: form.name, address: form.address || null, phone: form.phone || null };
    try {
      if (editing) {
        await publishersApi.update(editing.id, payload);
      } else {
        await publishersApi.create(payload);
      }
      setIsFormOpen(false);
      await loadPublishers();
    } catch (err) {
      setFormError(getErrorMessage(err, "Không lưu được nhà xuất bản."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await publishersApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadPublishers();
    } catch (err) {
      setListError(getErrorMessage(err, "Không xóa được nhà xuất bản."));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Publisher>[] = [
    { header: "Tên nhà xuất bản", render: (p) => <span className="font-medium text-slate-900">{p.name}</span> },
    { header: "Địa chỉ", render: (p) => p.address || "—" },
    { header: "Điện thoại", render: (p) => p.phone || "—" },
    {
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => openEditForm(p)}>
            Sửa
          </Button>
          <Button variant="danger" onClick={() => setDeleteTarget(p)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Nhà xuất bản"
        description="Quản lý danh sách nhà xuất bản."
        actions={<Button onClick={openCreateForm}>+ Thêm nhà xuất bản</Button>}
      />
      <ErrorBanner message={listError} />
      <div className="mt-3">
        <DataTable
          columns={columns}
          rows={publishers}
          rowKey={(p) => p.id}
          isLoading={isLoading}
          emptyMessage="Chưa có nhà xuất bản nào."
        />
      </div>

      <Modal open={isFormOpen} title={editing ? "Sửa nhà xuất bản" : "Thêm nhà xuất bản"} onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Tên" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Địa chỉ" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <ErrorBanner message={formError} />
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
        title="Xóa nhà xuất bản"
        message={`Bạn có chắc muốn xóa nhà xuất bản "${deleteTarget?.name}"?`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
