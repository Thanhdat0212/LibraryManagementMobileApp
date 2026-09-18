// Khớp với Application/DTOs/BorrowRecord/BorrowRecord.cs
export type BorrowStatus = "Borrowing" | "Returned";

export interface BorrowRecord {
  id: number;
  bookCopyId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  renewalCount: number;
}

export interface CreateBorrowRecordRequest {
  bookCopyId: number;
  userId: number;
  dueDate: string;
}
