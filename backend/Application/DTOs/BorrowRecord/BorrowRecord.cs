namespace Application.DTOs.BorrowRecord;

public class BorrowRecordDto
{
    public int Id { get; set; }
    public int BookCopyId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public DateTime BorrowDate { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class CreateBorrowRecordDto
{
    public int BookCopyId { get; set; }
    public int UserId { get; set; }
    public DateTime DueDate { get; set; }
}
