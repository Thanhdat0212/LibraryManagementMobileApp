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
