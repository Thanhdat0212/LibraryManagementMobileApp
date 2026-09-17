using Domain.Common;

namespace Domain.Entities;

public class Author : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Nationality { get; set; }

    public ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
}
