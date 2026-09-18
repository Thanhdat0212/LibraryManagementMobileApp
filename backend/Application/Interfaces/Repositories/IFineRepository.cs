using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repositories;

public interface IFineRepository : IRepository<Fine>
{
    Task<Fine?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Fine>> GetAllWithDetailsAsync(FineStatus? status);
    Task<IEnumerable<Fine>> GetAllByUserIdAsync(int userId);
    Task<bool> HasUnpaidFineAsync(int userId);
    Task<(int Count, decimal Amount)> GetUnpaidSummaryAsync();
}
