using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class BookCopy : BaseEntity
{
    public string CopyCode { get; set; } = string.Empty;
    public BookCopyStatus Status { get; set; } = BookCopyStatus.Available;

    public int BookId { get; set; }
    public Book? Book { get; set; }

    public ICollection<BorrowRecord> BorrowRecords { get; set; } = new List<BorrowRecord>();
}
