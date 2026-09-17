using Domain.Common;

namespace Domain.Entities;

public class Book : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Isbn { get; set; } = string.Empty;
    public int PublishedYear { get; set; }
    public string? CoverImageUrl { get; set; }
    public string? CoverImagePublicId { get; set; }

    public int PublisherId { get; set; }
    public Publisher? Publisher { get; set; }

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    public ICollection<BookCopy> BookCopies { get; set; } = new List<BookCopy>();
}
