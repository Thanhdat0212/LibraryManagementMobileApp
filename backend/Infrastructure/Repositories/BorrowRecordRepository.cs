using Application.Interfaces.Repositories;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace Infrastructure.Repositories;

public class BorrowRecordRepository : Repository<BorrowRecord>, IBorrowRecordRepository
{
    public BorrowRecordRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<BorrowRecord>> GetAllWithDetailsAsync()
    {
        return await _dbSet
            .Include(r => r.BookCopy)
            .ThenInclude(c => c!.Book)
            .Include(r => r.User)
            .ToListAsync();
    }

    public async Task<BorrowRecord?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.BookCopy)
            .ThenInclude(c => c!.Book)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<BorrowRecord>> GetAllByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(r => r.BookCopy)
            .ThenInclude(c => c!.Book)
            .Include(r => r.User)
            .Where(r => r.UserId == userId)
            .ToListAsync();
    }
}