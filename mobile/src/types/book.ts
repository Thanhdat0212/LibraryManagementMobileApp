// Khớp với Application/DTOs/Book/BookDto.cs
export interface Book {
  id: number;
  title: string;
  isbn: string;
  publishedYear: number;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  publisherId: number;
  publisherName: string;
  categoryId: number;
  categoryName: string;
  authorNames: string[];
  totalCopies: number;
  availableCopies: number;
}

export interface BookQuery {
  search?: string;
  categoryId?: number;
  authorId?: number;
  publisherId?: number;
  onlyAvailable?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateBookRequest {
  title: string;
  isbn: string;
  publishedYear: number;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  publisherId: number;
  categoryId: number;
  authorIds: number[];
}

export type UpdateBookRequest = CreateBookRequest;
