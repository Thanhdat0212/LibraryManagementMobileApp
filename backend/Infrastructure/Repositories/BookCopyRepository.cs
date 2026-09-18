namespace Infrastructure.Repositories;

using Domain.Entities;
using Domain.Enums;
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

    public async Task<BookCopy?> GetFirstAvailableByBookIdAsync(int bookId)
    {
        return await _dbSet
            .Where(c => c.BookId == bookId && c.Status == BookCopyStatus.Available)
            .OrderBy(c => c.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<int> CountAvailableAsync()
    {
        return await _dbSet.CountAsync(c => c.Status == BookCopyStatus.Available);
    }
}