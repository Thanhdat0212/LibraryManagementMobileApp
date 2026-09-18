using Application.DTOs.Book;
using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IBookRepository : IRepository<Book>
{
    Task<Book?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Book>> GetAllWithDetailsAsync();
    Task<(IEnumerable<Book> Items, int TotalCount)> SearchAsync(BookQueryDto query);
}
