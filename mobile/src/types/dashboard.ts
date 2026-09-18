export interface DashboardSummary {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeBorrows: number;
  overdueBorrows: number;
  totalUsers: number;
  pendingBorrowRequests: number;
  unpaidFinesCount: number;
  unpaidFinesAmount: number;
}
