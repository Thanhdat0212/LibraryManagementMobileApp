namespace Application.DTOs.BookCopy;


// Book copy dùng khi tái bản 1 sách. 
public class BookCopyDto
{

    // Dữ liệu lấy ra khi Get
    public int Id { get; set; }
    public string CopyCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int BookId { get; set; }
    public string BookTitle { get; set; } = string.Empty;
}

public class CreateBookCopyDto
{

    public string CopyCode { get; set; } = string.Empty;
    public int BookId { get; set; }
}

public class UpdateBookCopyDto
{
    public string CopyCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
