using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repositories;

public interface IBorrowRequestRepository : IRepository<BorrowRequest>
{
    Task<BorrowRequest?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<BorrowRequest>> GetAllWithDetailsAsync(BorrowRequestStatus? status);
    Task<IEnumerable<BorrowRequest>> GetAllByUserIdAsync(int userId);
    Task<int> CountPendingAsync();
    Task<bool> HasPendingRequestAsync(int userId, int bookId);
}
