namespace Infrastructure.Repositories;

using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces.Repositories;

public class BookCopyRepository : Repository<BookCopy>, IBookCopyRepository
{
    public BookCopyRepository(AppDbContext context) : base(context)
    {
    }

    public  async Task<IEnumerable<BookCopy>> GetAllWithBookAsync()
    {
        return await _dbSet
              .Include(c => c.Book)
              .ToListAsync();
    }

    public async Task<BookCopy?> GetByIdWithBookAsync(int id)
    {
        return await _dbSet
            .Include(c => c.Book)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}