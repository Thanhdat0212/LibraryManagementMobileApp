import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { booksApi } from "../../api/booksApi";
import { authorsApi } from "../../api/authorsApi";
import { categoriesApi } from "../../api/categoriesApi";
import { publishersApi } from "../../api/publishersApi";
import { mediaApi } from "../../api/mediaApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import type { Author } from "../../types/author";
import type { Category } from "../../types/category";
import type { Publisher } from "../../types/publisher";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable, { type Column } from "../../components/ui/DataTable";
import ErrorBanner from "../../components/ui/ErrorBanner";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";

interface BookFormState {
  title: string;
  isbn: string;
  publishedYear: string;
  publisherId: string;
  categoryId: string;
  authorIds: number[];
  coverImageUrl: string;
  coverImagePublicId: string;
}

const emptyForm: BookFormState = {
  title: "",
  isbn: "",
  publishedYear: String(new Date().getFullYear()),
  publisherId: "",
  categoryId: "",
  authorIds: [],
  coverImageUrl: "",
  coverImagePublicId: "",
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Book | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<BookFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadAll() {
    setIsLoading(true);
    setListError(null);
    try {
      const [booksRes, authorsRes, categoriesRes, publishersRes] = await Promise.all([
        booksApi.getAll(),
        authorsApi.getAll(),
        categoriesApi.getAll(),
        publishersApi.getAll(),
      ]);
      setBooks(booksRes);
      setAuthors(authorsRes);
      setCategories(categoriesRes);
      setPublishers(publishersRes);
    } catch (err) {
      setListError(getErrorMessage(err, "Không tải được danh sách sách."));
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

  function openEditForm(book: Book) {
    setEditing(book);
    setForm({
      title: book.title,
      isbn: book.isbn,
      publishedYear: String(book.publishedYear),
      publisherId: String(book.publisherId),
      categoryId: String(book.categoryId),
      // BookDto chỉ trả về AuthorNames (không có AuthorIds), nên phải map ngược theo tên.
      authorIds: authors.filter((a) => book.authorNames.includes(a.fullName)).map((a) => a.id),
      coverImageUrl: book.coverImageUrl ?? "",
      coverImagePublicId: book.coverImagePublicId ?? "",
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function toggleAuthor(id: number) {
    setForm((prev) => ({
      ...prev,
      authorIds: prev.authorIds.includes(id)
        ? prev.authorIds.filter((a) => a !== id)
        : [...prev.authorIds, id],
    }));
  }

  async function handleCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setFormError(null);
    try {
      const uploaded = await mediaApi.uploadImage(file, "books");
      setForm((prev) => ({ ...prev, coverImageUrl: uploaded.url, coverImagePublicId: uploaded.publicId }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Tải ảnh bìa thất bại.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.publisherId || !form.categoryId) {
      setFormError("Vui lòng chọn nhà xuất bản và thể loại.");
      return;
    }
    if (form.authorIds.length === 0) {
      setFormError("Vui lòng chọn ít nhất một tác giả.");
      return;
    }

    setIsSaving(true);
    const payload = {
      title: form.title,
      isbn: form.isbn,
      publishedYear: Number(form.publishedYear),
      coverImageUrl: form.coverImageUrl || null,
      coverImagePublicId: form.coverImagePublicId || null,
      publisherId: Number(form.publisherId),
      categoryId: Number(form.categoryId),
      authorIds: form.authorIds,
    };
    try {
      if (editing) {
        await booksApi.update(editing.id, payload);
      } else {
        await booksApi.create(payload);
      }
      setIsFormOpen(false);
      await loadAll();
    } catch (err) {
      setFormError(getErrorMessage(err, "Không lưu được sách."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await booksApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      setListError(getErrorMessage(err, "Không xóa được sách."));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<Book>[] = [
    {
      header: "Bìa",
      render: (b) =>
        b.coverImageUrl ? (
          <img src={b.coverImageUrl} alt={b.title} className="h-14 w-10 rounded object-cover" />
        ) : (
          <div className="h-14 w-10 rounded bg-slate-100" />
        ),
    },
    {
      header: "Tên sách",
      render: (b) => (
        <div>
          <p className="font-medium text-slate-900">{b.title}</p>
          <p className="text-xs text-slate-500">ISBN: {b.isbn}</p>
        </div>
      ),
    },
    { header: "Tác giả", render: (b) => b.authorNames.join(", ") || "—" },
    { header: "Thể loại", render: (b) => b.categoryName },
    { header: "NXB", render: (b) => b.publisherName },
    { header: "Năm XB", render: (b) => b.publishedYear },
    {
      header: "",
      className: "text-right",
      render: (b) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => openEditForm(b)}>
            Sửa
          </Button>
          <Button variant="danger" onClick={() => setDeleteTarget(b)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sách"
        description="Quản lý danh mục đầu sách."
        actions={<Button onClick={openCreateForm}>+ Thêm sách</Button>}
      />
      <ErrorBanner message={listError} />
      <div className="mt-3">
        <DataTable columns={columns} rows={books} rowKey={(b) => b.id} isLoading={isLoading} emptyMessage="Chưa có sách nào." />
      </div>

      <Modal open={isFormOpen} title={editing ? "Sửa sách" : "Thêm sách"} onClose={() => setIsFormOpen(false)} widthClassName="max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input label="Tên sách" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ISBN" required value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
            <Input
              label="Năm xuất bản"
              type="number"
              required
              value={form.publishedYear}
              onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Nhà xuất bản"
              required
              value={form.publisherId}
              onChange={(e) => setForm({ ...form, publisherId: e.target.value })}
            >
              <option value="">-- Chọn NXB --</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              label="Thể loại"
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">-- Chọn thể loại --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-700">Tác giả</span>
            <div className="mt-1 max-h-32 overflow-y-auto rounded-md border border-slate-300 p-2">
              {authors.length === 0 && <p className="text-sm text-slate-400">Chưa có tác giả nào.</p>}
              {authors.map((a) => (
                <label key={a.id} className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.authorIds.includes(a.id)}
                    onChange={() => toggleAuthor(a.id)}
                  />
                  {a.fullName}
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-700">Ảnh bìa</span>
            <div className="mt-1 flex items-center gap-3">
              {form.coverImageUrl && (
                <img src={form.coverImageUrl} alt="Bìa sách" className="h-16 w-12 rounded object-cover" />
              )}
              <input type="file" accept="image/*" onChange={handleCoverChange} disabled={isUploading} className="text-sm" />
              {isUploading && <span className="text-xs text-slate-500">Đang tải...</span>}
            </div>
          </div>

          <ErrorBanner message={formError} />
          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={isUploading}>
              Lưu
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa sách"
        message={`Bạn có chắc muốn xóa sách "${deleteTarget?.title}"?`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
