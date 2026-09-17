// Khớp với Application/DTOs/Book/BookCopy/BookCopyDto.cs
export type BookCopyStatus = "Available" | "Borrowed" | "Lost" | "Damaged";

export interface BookCopy {
  id: number;
  copyCode: string;
  status: BookCopyStatus;
  bookId: number;
  bookTitle: string;
}

export interface CreateBookCopyRequest {
  copyCode: string;
  bookId: number;
}

export interface UpdateBookCopyRequest {
  copyCode: string;
  status: BookCopyStatus;
}
