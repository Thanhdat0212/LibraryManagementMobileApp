using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IBookRepository : IRepository<Book>
{
    Task<Book?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Book>> GetAllWithDetailsAsync();
}
