using Application.DTOs.Fine;
using Domain.Enums;

namespace Application.Interfaces.Services;

public interface IFineService
{
    Task<IEnumerable<FineDto>> GetAllAsync(FineStatus? status);
    Task<IEnumerable<FineDto>> GetByUserIdAsync(int userId);
    Task<FineDto?> GetByIdAsync(int id);
    Task<FineDto> PayAsync(int id);
}
