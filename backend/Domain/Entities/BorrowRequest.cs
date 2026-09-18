using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class BorrowRequest : BaseEntity
{
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public BorrowRequestStatus Status { get; set; } = BorrowRequestStatus.Pending;
    public string? Note { get; set; }
    public DateTime? ProcessedAt { get; set; }

    public int BookId { get; set; }
    public Book? Book { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int? ProcessedByUserId { get; set; }
    public User? ProcessedByUser { get; set; }

    public int? ResultingBorrowRecordId { get; set; }
    public BorrowRecord? ResultingBorrowRecord { get; set; }
}
