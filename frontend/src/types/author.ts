export interface Author {
  id: number;
  fullName: string;
  bio?: string | null;
  nationality?: string | null;
}

export interface CreateAuthorRequest {
  fullName: string;
  bio?: string | null;
  nationality?: string | null;
}

export type UpdateAuthorRequest = CreateAuthorRequest;
