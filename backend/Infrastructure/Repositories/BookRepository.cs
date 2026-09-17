namespace Infrastructure.Repositories;

using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


public class BookRepository : Repository<Book>, IBookRepository
{
    public BookRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Book>> GetAllWithDetailsAsync()
    {
        return await _dbSet
            .Include(b => b.Publisher)
            .Include(b => b.Category)
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .ToListAsync();
    }

    public async Task<Book?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(b => b.Publisher)
            .Include(b => b.Category)
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(b => b.Id == id);
    }
}
