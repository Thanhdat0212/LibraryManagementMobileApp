using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class Fine : BaseEntity
{
    public decimal Amount { get; set; }
    public FineReason Reason { get; set; } = FineReason.Overdue;
    public FineStatus Status { get; set; } = FineStatus.Unpaid;
    public DateTime? PaidAt { get; set; }

    public int BorrowRecordId { get; set; }
    public BorrowRecord? BorrowRecord { get; set; }
}
