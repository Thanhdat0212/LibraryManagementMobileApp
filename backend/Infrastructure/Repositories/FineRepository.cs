using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class FineRepository : Repository<Fine>, IFineRepository
{
    public FineRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Fine?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(f => f.BorrowRecord)
            .ThenInclude(r => r!.BookCopy)
            .ThenInclude(c => c!.Book)
            .Include(f => f.BorrowRecord)
            .ThenInclude(r => r!.User)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<IEnumerable<Fine>> GetAllWithDetailsAsync(FineStatus? status)
    {
        var q = _dbSet
            .Include(f => f.BorrowRecord)
            .ThenInclude(r => r!.BookCopy)
            .ThenInclude(c => c!.Book)
            .Include(f => f.BorrowRecord)
            .ThenInclude(r => r!.User)
            .AsQueryable();

        if (status.HasValue)
            q = q.Where(f => f.Status == status);

        return await q.OrderByDescending(f => f.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<Fine>> GetAllByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(f => f.BorrowRecord)
            .ThenInclude(r => r!.BookCopy)
            .ThenInclude(c => c!.Book)
            .Include(f => f.BorrowRecord)
            .ThenInclude(r => r!.User)
            .Where(f => f.BorrowRecord!.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> HasUnpaidFineAsync(int userId)
    {
        return await _dbSet.AnyAsync(f => f.BorrowRecord!.UserId == userId && f.Status == FineStatus.Unpaid);
    }

    public async Task<(int Count, decimal Amount)> GetUnpaidSummaryAsync()
    {
        var unpaid = _dbSet.Where(f => f.Status == FineStatus.Unpaid);
        var count = await unpaid.CountAsync();
        var amount = await unpaid.SumAsync(f => (decimal?)f.Amount) ?? 0;
        return (count, amount);
    }
}
