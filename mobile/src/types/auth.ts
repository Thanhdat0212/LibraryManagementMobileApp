export type UserRole = "Admin" | "Member";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

// Khớp với AuthResponseDto ở backend (Application/DTOs/Auth/AuthDtos.cs)
export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: UserRole;
}
