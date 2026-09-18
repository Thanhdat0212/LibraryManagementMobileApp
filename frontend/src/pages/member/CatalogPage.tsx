import { useEffect, useState } from "react";
import { booksApi } from "../../api/booksApi";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { categoriesApi } from "../../api/categoriesApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import type { Category } from "../../types/category";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";

const PAGE_SIZE = 12;

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  const [requestingBookId, setRequestingBookId] = useState<number | null>(null);
  const [requestedBookIds, setRequestedBookIds] = useState<number[]>([]);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      booksApi
        .getAll({
          search: search || undefined,
          categoryId: categoryId ? Number(categoryId) : undefined,
          page,
          pageSize: PAGE_SIZE,
        })
        .then((res) => {
          setBooks(res.items);
          setTotalCount(res.totalCount);
        })
        .catch((err) => setError(getErrorMessage(err, "Không tải được danh mục sách.")))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [search, categoryId, page]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  async function handleRequestBorrow(book: Book) {
    setRequestingBookId(book.id);
    setRequestMessage(null);
    try {
      await borrowRequestsApi.create({ bookId: book.id });
      setRequestedBookIds((prev) => [...prev, book.id]);
      setRequestMessage(`Đã gửi yêu cầu mượn "${book.title}". Vui lòng chờ thủ thư duyệt.`);
    } catch (err) {
      setRequestMessage(getErrorMessage(err, "Không gửi được yêu cầu mượn sách."));
    } finally {
      setRequestingBookId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Danh mục sách" description="Tìm sách và gửi yêu cầu mượn, thủ thư sẽ duyệt và giao sách tại quầy." />
      <ErrorBanner message={error} />
      {requestMessage && (
        <div className="mb-3 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          {requestMessage}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="min-w-56 flex-1">
          <Input placeholder="Tìm theo tên sách hoặc ISBN..." value={search} onChange={(e) => handleSearchChange(e.target.value)} />
        </div>
        <div className="w-56">
          <Select value={categoryId} onChange={(e) => handleCategoryChange(e.target.value)}>
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
      ) : books.length === 0 ? (
        <EmptyState message="Không tìm thấy sách phù hợp." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {books.map((book) => {
              const alreadyRequested = requestedBookIds.includes(book.id);
              return (
                <div key={book.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  {book.coverImageUrl ? (
                    <div className="mb-2 aspect-[2/3] w-full overflow-hidden rounded bg-slate-100">
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="mb-2 flex aspect-[2/3] w-full items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                      Không có ảnh bìa
                    </div>
                  )}
                  <p className="line-clamp-2 text-sm font-medium text-slate-900">{book.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{book.authorNames.join(", ") || "Chưa rõ tác giả"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {book.categoryName} · {book.publishedYear}
                  </p>
                  <p className={`mt-1 text-xs font-medium ${book.availableCopies > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {book.availableCopies > 0 ? `Còn ${book.availableCopies}/${book.totalCopies} bản` : "Hiện đã hết bản có sẵn"}
                  </p>
                  <Button
                    className="mt-2 w-full"
                    disabled={book.availableCopies === 0 || alreadyRequested}
                    isLoading={requestingBookId === book.id}
                    onClick={() => handleRequestBorrow(book)}
                  >
                    {alreadyRequested ? "Đã gửi yêu cầu" : "Yêu cầu mượn"}
                  </Button>
                </div>
              );
            })}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} totalCount={totalCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
