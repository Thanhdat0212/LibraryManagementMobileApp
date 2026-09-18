import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * React không tự phục hồi khi 1 component throw lúc render — cả cây bị unmount,
 * để lại màn hình trắng (div#root rỗng) mà không có thông tin gì để debug.
 * Boundary này chặn lỗi ở gốc app và hiện thông báo thay vì màn hình trắng.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Lỗi không xử lý được ở giao diện:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-900">Đã có lỗi xảy ra</p>
          <p className="mt-2 text-sm text-slate-500">
            Trang gặp sự cố khi hiển thị. Vui lòng tải lại trang; nếu lỗi vẫn tiếp diễn, hãy báo cho quản trị viên.
          </p>
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-left text-xs text-slate-400 break-words">
            {error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}
