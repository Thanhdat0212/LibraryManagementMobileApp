// Khớp với Application/DTOs/User/UserDto.cs
export interface LibraryUser {
  id: number;
  fullName: string;
  email: string;
  role: "Admin" | "Member";
}
