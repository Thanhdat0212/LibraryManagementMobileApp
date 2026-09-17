namespace Application.DTOs.Book;

public class BookDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Isbn { get; set; } = string.Empty;
    public int PublishedYear { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImagePublicId { get; set; }
    public int PublisherId { get; set; }
    public string PublisherName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public List<string> AuthorNames { get; set; } = new();
}

public class CreateBookDto
{
    public string Title { get; set; } = string.Empty;
    public string Isbn { get; set; } = string.Empty;
    public int PublishedYear { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImagePublicId { get; set; }
    public int PublisherId { get; set; }
    public int CategoryId { get; set; }
    public List<int> AuthorIds { get; set; } = new();
}

public class UpdateBookDto
{
    public string Title { get; set; } = string.Empty;
    public string Isbn { get; set; } = string.Empty;
    public int PublishedYear { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImagePublicId { get; set; }
    public int PublisherId { get; set; }
    public int CategoryId { get; set; }
    public List<int> AuthorIds { get; set; } = new();
}
