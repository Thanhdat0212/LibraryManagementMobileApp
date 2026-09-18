import { useEffect, useState, type FormEvent } from "react";
import { categoriesApi } from "../../api/categoriesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Category } from "../../types/category";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../components/ui/DataTable";
import Notice from "../../components/ui/Notice";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import RowActions from "../../components/ui/RowActions";
import Textarea from "../../components/ui/Textarea";

const emptyForm = { name: "", description: "" };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadCategories() {
    setIsLoading(true);
    setListError(null);
    try {
      setCategories(await categoriesApi.getAll());
    } catch (err) {
      setListError(getErrorMessage(err, "Không tải được danh sách thể loại."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateForm() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditing(category);
    setForm({ name: category.name, description: category.description ?? "" });
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    const payload = { name: form.name, description: form.description || null };
    try {
      if (editing) {
        await categoriesApi.update(editing.id, payload);
      } else {
        await categoriesApi.create(payload);
      }
      setIsFormOpen(false);
      await loadCategories();
    } catch (err) {
      setFormError(getErrorMessage(err, "Không lưu được thể loại."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await categoriesApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadCategories();
    } catch (err) {
      setListError(getErrorMessage(err, "Không xóa được thể loại."));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Category>[] = [
    { header: "Tên thể loại", render: (c) => <span className="font-medium text-slate-900">{c.name}</span> },
    { header: "Mô tả", render: (c) => <span className="line-clamp-2 max-w-md text-slate-500">{c.description || "—"}</span> },
    {
      header: "",
      className: "text-right",
      render: (c) => <RowActions onEdit={() => openEditForm(c)} onDelete={() => setDeleteTarget(c)} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Thể loại"
        description="Quản lý danh sách thể loại sách."
        actions={<Button onClick={openCreateForm}>+ Thêm thể loại</Button>}
      />
      <Notice tone="danger" message={listError} className="mb-3" />
      <div className="mt-3">
        <DataTable columns={columns} rows={categories} rowKey={(c) => c.id} isLoading={isLoading} emptyMessage="Chưa có thể loại nào." />
      </div>

      <Modal open={isFormOpen} title={editing ? "Sửa thể loại" : "Thêm thể loại"} onClose={() => setIsFormOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Tên thể loại" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea
            label="Mô tả"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
        title="Xóa thể loại"
        message={`Bạn có chắc muốn xóa thể loại "${deleteTarget?.name}"?`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
