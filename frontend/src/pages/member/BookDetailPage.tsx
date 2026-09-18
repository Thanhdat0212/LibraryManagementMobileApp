import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { booksApi } from "../../api/booksApi";
import { borrowRequestsApi } from "../../api/borrowRequestsApi";
import { getErrorMessage } from "../../api/axiosClient";
import type { Book } from "../../types/book";
import Button from "../../components/ui/Button";
import Notice from "../../components/ui/Notice";
import PageHeader from "../../components/ui/PageHeader";
import Spinner from "../../components/ui/Spinner";
import Textarea from "../../components/ui/Textarea";

interface RequestFeedback {
  tone: "success" | "danger";
  text: string;
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState<RequestFeedback | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    booksApi
      .getById(Number(id))
      .then(setBook)
      .catch((err) => setError(getErrorMessage(err, "Không tải được thông tin sách.")))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleRequestBorrow() {
    if (!book) return;
    setIsRequesting(true);
    setRequestFeedback(null);
    try {
      await borrowRequestsApi.create({ bookId: book.id, note: note.trim() || undefined });
      setRequested(true);
      setRequestFeedback({ tone: "success", text: `Đã gửi yêu cầu mượn "${book.title}". Vui lòng chờ thủ thư duyệt.` });
    } catch (err) {
      setRequestFeedback({ tone: "danger", text: getErrorMessage(err, "Không gửi được yêu cầu mượn sách.") });
    } finally {
      setIsRequesting(false);
    }
  }

  if (isLoading) return <Spinner />;

  if (error || !book) {
    return (
      <div>
        <Notice tone="danger" message={error ?? "Không tìm thấy sách."} />
        <Link to="/catalog" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
          ← Quay lại danh mục sách
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 text-sm text-indigo-600 hover:underline"
      >
        ← Quay lại
      </button>
      <PageHeader title={book.title} description={`${book.categoryName} · ${book.publishedYear}`} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} className="h-80 w-full rounded-lg object-cover sm:h-auto" />
        ) : (
          <div className="flex h-80 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400 sm:h-auto">
            Không có ảnh bìa
          </div>
        )}

        <div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-slate-500">Tác giả</dt>
            <dd className="text-slate-900">{book.authorNames.join(", ") || "Chưa rõ tác giả"}</dd>
            <dt className="text-slate-500">Nhà xuất bản</dt>
            <dd className="text-slate-900">{book.publisherName}</dd>
            <dt className="text-slate-500">Thể loại</dt>
            <dd className="text-slate-900">{book.categoryName}</dd>
            <dt className="text-slate-500">Năm xuất bản</dt>
            <dd className="text-slate-900">{book.publishedYear}</dd>
            <dt className="text-slate-500">ISBN</dt>
            <dd className="text-slate-900">{book.isbn}</dd>
            <dt className="text-slate-500">Tình trạng</dt>
            <dd className={book.availableCopies > 0 ? "font-medium text-emerald-600" : "font-medium text-red-500"}>
              {book.availableCopies > 0 ? `Còn ${book.availableCopies}/${book.totalCopies} bản` : "Hiện đã hết bản có sẵn"}
            </dd>
          </dl>

          <div className="mt-5 max-w-md">
            {requestFeedback && <Notice tone={requestFeedback.tone} message={requestFeedback.text} className="mb-3" />}
            {!requested && (
              <Textarea
                label="Ghi chú cho thủ thư (không bắt buộc)"
                placeholder="Ví dụ: mượn cho môn học XYZ, cần lấy trước ngày..."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}
            <Button
              className="mt-3"
              disabled={book.availableCopies === 0 || requested}
              isLoading={isRequesting}
              onClick={handleRequestBorrow}
            >
              {requested ? "Đã gửi yêu cầu" : "Yêu cầu mượn"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
