import { useEffect, useMemo, useState } from "react";
import { booksApi } from "../../api/booksApi";
import { categoriesApi } from "../../api/categoriesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import type { Category } from "../../types/category";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    Promise.all([booksApi.getAll(), categoriesApi.getAll()])
      .then(([booksRes, categoriesRes]) => {
        setBooks(booksRes);
        setCategories(categoriesRes);
      })
      .catch((err) => setError(getErrorMessage(err, "Không tải được danh mục sách.")))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch = b.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = !categoryId || String(b.categoryId) === categoryId;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, categoryId]);

  return (
    <div>
      <PageHeader title="Danh mục sách" description="Tìm và xem thông tin sách trong thư viện." />
      <ErrorBanner message={error} />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="min-w-56 flex-1">
          <Input placeholder="Tìm theo tên sách..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-56">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Tất cả thể loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : filteredBooks.length === 0 ? (
        <EmptyState message="Không tìm thấy sách phù hợp." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredBooks.map((book) => (
            <div key={book.id} className="rounded-lg border border-slate-200 bg-white p-3">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={book.title} className="mb-2 h-40 w-full rounded object-cover" />
              ) : (
                <div className="mb-2 flex h-40 w-full items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                  Không có ảnh bìa
                </div>
              )}
              <p className="line-clamp-2 text-sm font-medium text-slate-900">{book.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{book.authorNames.join(", ") || "Chưa rõ tác giả"}</p>
              <p className="mt-1 text-xs text-slate-400">
                {book.categoryName} · {book.publishedYear}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
