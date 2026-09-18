export type BorrowRequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface BorrowRequest {
  id: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  requestedAt: string;
  status: BorrowRequestStatus;
  note?: string | null;
  processedAt?: string | null;
  resultingBorrowRecordId?: number | null;
}

export interface CreateBorrowRequestRequest {
  bookId: number;
  note?: string;
}
