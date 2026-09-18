using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Member;
    public bool IsLocked { get; set; } = false;

    public ICollection<BorrowRecord> BorrowRecords { get; set; } = new List<BorrowRecord>();
    public ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();
}
