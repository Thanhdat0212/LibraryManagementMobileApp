export interface Publisher {
  id: number;
  name: string;
  address?: string | null;
  phone?: string | null;
}

export interface CreatePublisherRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
}

export type UpdatePublisherRequest = CreatePublisherRequest;
