import type { BookCopyStatus } from "../types/bookCopy";
import type { BorrowStatus } from "../types/borrowRecord";

interface StatusMeta {
  label: string;
  color: string;
}

export const bookCopyStatusMeta: Record<BookCopyStatus, StatusMeta> = {
  Available: { label: "Sẵn sàng", color: "#16a34a" },
  Borrowed: { label: "Đang mượn", color: "#2563eb" },
  Lost: { label: "Mất", color: "#dc2626" },
  Damaged: { label: "Hư hỏng", color: "#d97706" },
};

export function borrowStatusMeta(status: BorrowStatus, dueDate: string): StatusMeta {
  if (status === "Returned") return { label: "Đã trả", color: "#16a34a" };
  const isOverdue = new Date(dueDate).getTime() < Date.now();
  return isOverdue
    ? { label: "Quá hạn", color: "#dc2626" }
    : { label: "Đang mượn", color: "#2563eb" };
}
