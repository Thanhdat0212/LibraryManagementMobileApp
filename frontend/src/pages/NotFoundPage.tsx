import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-50 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">404</h1>
      <p className="text-sm text-slate-500">Không tìm thấy trang bạn yêu cầu.</p>
      <Link to="/" className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
        Về trang chủ
      </Link>
    </div>
  );
}
