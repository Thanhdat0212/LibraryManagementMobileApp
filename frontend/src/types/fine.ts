export type FineStatus = "Unpaid" | "Paid" | "Waived";
export type FineReason = "Overdue" | "Lost" | "Damaged";

export interface Fine {
  id: number;
  borrowRecordId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  amount: number;
  reason: FineReason;
  status: FineStatus;
  createdAt: string;
  paidAt?: string | null;
}
