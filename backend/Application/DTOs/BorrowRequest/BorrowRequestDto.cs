namespace Application.DTOs.BorrowRequest;

public class BorrowRequestDto
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public int? ResultingBorrowRecordId { get; set; }
}

public class CreateBorrowRequestDto
{
    public int BookId { get; set; }
    public string? Note { get; set; }
}

public class RejectBorrowRequestDto
{
    public string? Reason { get; set; }
}
