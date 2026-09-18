namespace Application.DTOs.Book;

public class BookQueryDto
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public int? AuthorId { get; set; }
    public int? PublisherId { get; set; }
    public bool OnlyAvailable { get; set; } = false;

    private int _page = 1;
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    private int _pageSize = 20;
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value is < 1 or > 100 ? 20 : value;
    }
}
