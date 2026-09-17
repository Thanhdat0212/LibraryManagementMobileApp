using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class BorrowRecord : BaseEntity
{
    public DateTime BorrowDate { get; set; } = DateTime.UtcNow;
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public BorrowStatus Status { get; set; } = BorrowStatus.Borrowing;

    public int BookCopyId { get; set; }
    public BookCopy? BookCopy { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }
}
