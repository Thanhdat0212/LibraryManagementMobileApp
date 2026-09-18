using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IBookCopyRepository : IRepository<BookCopy>
{
    Task<BookCopy?> GetByIdWithBookAsync(int id);
    Task<IEnumerable<BookCopy>> GetAllWithBookAsync();
    Task<BookCopy?> GetFirstAvailableByBookIdAsync(int bookId);
    Task<int> CountAvailableAsync();
}
