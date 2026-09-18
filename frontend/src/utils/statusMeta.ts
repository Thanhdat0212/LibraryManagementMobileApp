import type { BorrowRecord } from "../types/borrowRecord";

export type EffectiveBorrowStatus = "Borrowing" | "Overdue" | "Returned";

/** BE chỉ lưu Borrowing/Returned; "Quá hạn" được suy ra ở đây để cả 2 nền tảng hiển thị nhất quán. */
export function effectiveBorrowStatus(record: BorrowRecord): EffectiveBorrowStatus {
  if (record.status === "Returned") return "Returned";
  return new Date(record.dueDate).getTime() < Date.now() ? "Overdue" : "Borrowing";
}

export const borrowStatusTone: Record<EffectiveBorrowStatus, "blue" | "green" | "red"> = {
  Borrowing: "blue",
  Overdue: "red",
  Returned: "green",
};

export const borrowStatusLabel: Record<EffectiveBorrowStatus, string> = {
  Borrowing: "Đang mượn",
  Overdue: "Quá hạn",
  Returned: "Đã trả",
};
