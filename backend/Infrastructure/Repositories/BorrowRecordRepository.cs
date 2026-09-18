using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
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

    public async Task<int> CountActiveByUserIdAsync(int userId)
    {
        return await _dbSet.CountAsync(r => r.UserId == userId && r.Status == BorrowStatus.Borrowing);
    }

    public async Task<int> CountActiveAsync()
    {
        return await _dbSet.CountAsync(r => r.Status == BorrowStatus.Borrowing);
    }

    public async Task<int> CountOverdueAsync()
    {
        var now = DateTime.UtcNow;
        return await _dbSet.CountAsync(r => r.Status == BorrowStatus.Borrowing && r.DueDate < now);
    }
}