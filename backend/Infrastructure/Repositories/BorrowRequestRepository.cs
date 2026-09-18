using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class BorrowRequestRepository : Repository<BorrowRequest>, IBorrowRequestRepository
{
    public BorrowRequestRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<BorrowRequest?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(r => r.Book)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<IEnumerable<BorrowRequest>> GetAllWithDetailsAsync(BorrowRequestStatus? status)
    {
        var q = _dbSet.Include(r => r.Book).Include(r => r.User).AsQueryable();
        if (status.HasValue)
            q = q.Where(r => r.Status == status);

        return await q.OrderByDescending(r => r.RequestedAt).ToListAsync();
    }

    public async Task<IEnumerable<BorrowRequest>> GetAllByUserIdAsync(int userId)
    {
        return await _dbSet
            .Include(r => r.Book)
            .Include(r => r.User)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync();
    }

    public async Task<int> CountPendingAsync()
    {
        return await _dbSet.CountAsync(r => r.Status == BorrowRequestStatus.Pending);
    }

    public async Task<bool> HasPendingRequestAsync(int userId, int bookId)
    {
        return await _dbSet.AnyAsync(r =>
            r.UserId == userId && r.BookId == bookId && r.Status == BorrowRequestStatus.Pending);
    }
}
