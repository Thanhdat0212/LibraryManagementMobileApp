namespace Application.DTOs.User;

public class UserDto
{
    // Chỉ lộ các trường an toàn, KHÔNG bao giờ trả PasswordHash ra ngoài.
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsLocked { get; set; }
}
