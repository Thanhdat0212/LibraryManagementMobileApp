using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IBorrowRecordRepository : IRepository<BorrowRecord>
{
    Task<BorrowRecord?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<BorrowRecord>> GetAllWithDetailsAsync();
    Task<IEnumerable<BorrowRecord>> GetAllByUserIdAsync(int userId);
    Task<int> CountActiveByUserIdAsync(int userId);
    Task<int> CountActiveAsync();
    Task<int> CountOverdueAsync();
}
